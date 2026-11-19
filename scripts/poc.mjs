import fs from "node:fs"
import path from "node:path"
import net from "node:net"
import crypto from "node:crypto"
import { fileURLToPath } from "node:url"
import { spawn, spawnSync, execFileSync } from "node:child_process"

const root = fileURLToPath(new URL("../", import.meta.url))
const stateDir = path.join(root, ".poc")
const stateFile = path.join(stateDir, "processes.json")
const payloadCompose = ["compose", "-f", "apps/storefront/compose.payload.yaml"]
const apps = [
  { name: "backend", directory: "apps/backend", port: 9001, health: "/health" },
  { name: "storefront", directory: "apps/storefront", port: 8000, health: "/kr" },
]
fs.mkdirSync(stateDir, { recursive: true })
const [nodeMajor, nodeMinor, nodePatch] = process.versions.node.split(".").map(Number)
if (nodeMajor !== 24 || nodeMinor < 22 || (nodeMinor === 22 && nodePatch < 3)) {
  throw new Error("请使用 Node.js 24.22.3 或更新的 Node.js 24 LTS")
}

function run(command, args, cwd = root, capture = false) {
  const result = spawnSync(command, args, { cwd, env: process.env, stdio: capture ? "pipe" : "inherit", encoding: "utf8", maxBuffer: 32 * 1024 * 1024 })
  if (capture) { process.stdout.write(result.stdout ?? ""); process.stderr.write(result.stderr ?? "") }
  if (result.status !== 0) throw new Error(command + " 执行失败")
  return result.stdout
}
function readState() { return fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, "utf8")) : {} }
function saveState(state) { fs.writeFileSync(stateFile, JSON.stringify(state, null, 2) + "\n", { mode: 0o600 }) }
function belongsToProject(pid) {
  try { return execFileSync("ps", ["-p", String(pid), "-o", "args="], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).includes(root) }
  catch { return false }
}
async function portOpen(port) {
  return new Promise(resolve => {
    const socket = net.createConnection({ host: "127.0.0.1", port })
    socket.once("connect", () => { socket.destroy(); resolve(true) })
    socket.once("error", () => resolve(false))
  })
}
async function ready(app) {
  const deadline = Date.now() + 45000
  while (Date.now() < deadline) {
    try { const result = await fetch("http://localhost:" + app.port + app.health); if (result.ok) return }
    catch {}
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  throw new Error(app.name + " 未在 45 秒内就绪，请查看 .poc/" + app.name + ".log")
}
async function start() {
  run("docker", ["compose", "up", "-d", "--wait"])
  run("docker", [...payloadCompose, "up", "-d", "--wait"])
  const state = readState()
  for (const app of apps) {
    if (await portOpen(app.port)) {
      if (!state[app.name] || !belongsToProject(state[app.name])) throw new Error(String(app.port) + " 端口已被非本启动脚本管理的进程占用")
    } else {
      const output = fs.openSync(path.join(stateDir, app.name + ".log"), "a", 0o600)
      const child = spawn("pnpm", ["--dir", path.join(root, app.directory), "run", "dev"], { cwd: root, env: process.env, detached: true, stdio: ["ignore", output, output] })
      child.unref()
      fs.closeSync(output)
      state[app.name] = child.pid
      saveState(state)
    }
    await ready(app)
    console.log(app.name + " 已就绪：http://localhost:" + app.port + (app.name === "backend" ? "/app" : "/kr"))
  }
}
function stop() {
  const state = readState()
  for (const app of apps) {
    const pid = state[app.name]
    if (pid && belongsToProject(pid)) process.kill(-pid, "SIGTERM")
    delete state[app.name]
  }
  saveState(state)
  console.log("本项目应用进程已停止，PostgreSQL 数据卷保留。")
}
function initializeEnv() {
  const backend = path.join(root, "apps/backend/.env")
  const storefront = path.join(root, "apps/storefront/.env.local")
  const payloadEnv = path.join(root, "apps/storefront/.env")
  if (!fs.existsSync(backend)) fs.writeFileSync(backend, [
    "DATABASE_URL=postgres://shokz:shokz_local_poc@localhost:5442/shokz",
    "STORE_CORS=http://localhost:8000",
    "ADMIN_CORS=http://localhost:9001",
    "AUTH_CORS=http://localhost:8000,http://localhost:9001",
    "JWT_SECRET=" + crypto.randomBytes(32).toString("hex"),
    "COOKIE_SECRET=" + crypto.randomBytes(32).toString("hex"),
    "",
  ].join("\n"), { mode: 0o600 })
  if (!fs.existsSync(storefront)) fs.writeFileSync(storefront, [
    "NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9001",
    "NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=",
    "NEXT_PUBLIC_BASE_URL=http://localhost:8000",
    "NEXT_PUBLIC_DEFAULT_REGION=kr",
    "",
  ].join("\n"), { mode: 0o600 })
  if (!fs.existsSync(payloadEnv)) {
    const payloadEntries = fs.readFileSync(path.join(root, "apps/storefront/.env.template"), "utf8")
      .split("\n")
      .filter(line => /^(PAYLOAD_|CMS_)/.test(line))
      .map(line => line === "PAYLOAD_SECRET=" ? "PAYLOAD_SECRET=" + crypto.randomBytes(32).toString("hex") : line)
    fs.writeFileSync(payloadEnv, payloadEntries.join("\n") + "\n", { mode: 0o600 })
  }
}
async function setup() {
  run("pnpm", ["install", "--frozen-lockfile"])
  initializeEnv()
  run("docker", ["compose", "up", "-d", "--wait"])
  run("docker", [...payloadCompose, "up", "-d", "--wait"])
  const backendDir = path.join(root, "apps/backend")
  run("pnpm", ["exec", "medusa", "db:migrate", "--execute-all-links"], backendDir)
  const output = run("pnpm", ["exec", "medusa", "exec", "./src/scripts/seed-shokz.ts"], backendDir, true)
  if (output.includes("SHOKZ_DEMO_ADMIN_MISSING")) run("pnpm", ["exec", "medusa", "user", "-e", "admin@shokz.local", "-p", "ShokzPoc2026!"], backendDir)
  run("pnpm", ["--filter", "@dtc/storefront", "run", "cms:migrate"])
  run("pnpm", ["--filter", "@dtc/storefront", "run", "cms:seed"])
  console.log("初始化完成。运行 pnpm poc:start 启动商城和 Payload 后台。")
}

const action = process.argv[2]
if (action === "start") await start()
else if (action === "stop") stop()
else if (action === "setup") await setup()
else throw new Error("支持的操作：setup、start、stop")

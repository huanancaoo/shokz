const path = require("node:path")

const release = path.resolve(__dirname, "../..")
const backend = path.join(release, "apps/backend")
const storefront = path.join(release, "apps/storefront/.next/standalone/apps/storefront")
const node = "/opt/shokz/node/bin/node"

const processOptions = {
  interpreter: node,
  exec_mode: "fork",
  instances: 1,
  restart_delay: 3000,
  kill_timeout: 10000,
  out_file: "/dev/null",
  error_file: "/dev/null",
}

module.exports = {
  apps: [
    {
      ...processOptions,
      name: "shokz-medusa",
      cwd: path.join(backend, ".medusa/server"),
      script: path.join(backend, "node_modules/@medusajs/cli/cli.js"),
      args: ["start", "--host", "127.0.0.1", "--port", "19001"],
    },
    {
      ...processOptions,
      name: "shokz-storefront",
      cwd: storefront,
      script: path.join(storefront, "server.js"),
      env: { HOSTNAME: "127.0.0.1", PORT: "18082" },
    },
  ],
}

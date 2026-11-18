import { readdirSync, readFileSync, writeFileSync } from "node:fs"

const manifestPath = process.argv[2]
if (!manifestPath || !process.env.MEDUSA_PUBLIC_URL) {
  throw new Error("Provide the deployed media manifest and MEDUSA_PUBLIC_URL")
}

const mediaOrigin = new URL(process.env.MEDUSA_PUBLIC_URL)
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"))
const contentDirectory = new URL("../../apps/storefront/src/content/", import.meta.url)
const localMediaPrefix = "http://localhost:9001/static/"

function publishMediaUrl(_key, value) {
  if (typeof value !== "string" || !value.startsWith(localMediaPrefix)) return value

  // Medusa adds a timestamp to each upload. The captured asset name stays the same across imports.
  const assetName = value.slice(localMediaPrefix.length).replace(/^\d+-/, "")
  const fileId = manifest[`/shokz/${assetName}`]
  if (!fileId) throw new Error(`Missing deployed Shokz asset: ${assetName}`)

  return new URL(`/static/${encodeURIComponent(fileId)}`, mediaOrigin).href
}

const snapshots = readdirSync(contentDirectory)
  .filter((filename) => filename.endsWith(".json"))
  .map((filename) => {
    const file = new URL(filename, contentDirectory)
    const content = JSON.parse(readFileSync(file, "utf8"))
    return { file, content: JSON.stringify(content, publishMediaUrl, 2) + "\n" }
  })

for (const snapshot of snapshots) {
  writeFileSync(snapshot.file, snapshot.content)
}

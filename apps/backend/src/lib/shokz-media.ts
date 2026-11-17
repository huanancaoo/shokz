import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import type { MedusaContainer } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, MedusaError, Modules } from "@medusajs/framework/utils"
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows"

const mimeTypes: Record<string, string> = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
}

export async function createShokzMediaImporter(container: MedusaContainer) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const fileModule = container.resolve(Modules.FILE)
  const sourceDirectory = path.resolve(process.cwd(), "data/assets")
  const manifestPath = path.resolve(process.cwd(), "static/.shokz-media.json")
  // File Module 不存数据库；索引与本地上传文件一起保留，重复导入复用同一个文件 ID。
  let manifest: Record<string, string>
  try {
    manifest = JSON.parse(await readFile(manifestPath, "utf8"))
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error
    manifest = {}
  }
  const urls = new Map<string, string>()
  let uploaded = 0

  async function importUrl(source: string) {
    if (urls.has(source)) return urls.get(source)!
    if (manifest[source]) {
      const file = await fileModule.retrieveFile(manifest[source])
      urls.set(source, file.url)
      return file.url
    }
    const mimeType = mimeTypes[path.extname(source).toLowerCase()]
    if (!mimeType) throw new MedusaError(MedusaError.Types.INVALID_DATA, `Unsupported Shokz media type: ${source}`)
    const content = await readFile(path.join(sourceDirectory, path.basename(source)))
    const { result } = await uploadFilesWorkflow(container).run({
      input: {
        files: [{
          filename: path.basename(source),
          mimeType,
          // 使用 base64 保留原始字节，避免图片和视频被按文本重新编码。
          content: content.toString("base64"),
          access: "public",
        }],
      },
    })
    const file = result[0]
    manifest[source] = file.id
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n")
    urls.set(source, file.url)
    uploaded++
    if (uploaded % 50 === 0) logger.info(`Shokz media: uploaded ${uploaded} files`)
    return file.url
  }

  async function visit(value: unknown): Promise<unknown> {
    if (typeof value === "string" && value.startsWith("/shokz/")) return importUrl(value)
    if (Array.isArray(value)) {
      const result: unknown[] = []
      // 详情含视频；顺序读取避免一次将整个素材集编码到内存。
      for (const item of value) result.push(await visit(item))
      return result
    }
    if (value && typeof value === "object") {
      const result: Record<string, unknown> = {}
      for (const [key, item] of Object.entries(value)) result[key] = await visit(item)
      return result
    }
    return value
  }

  return async function importShokzMedia<T>(value: T): Promise<T> {
    return (await visit(value)) as T
  }
}

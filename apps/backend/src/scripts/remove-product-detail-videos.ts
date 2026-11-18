import { readFile } from "node:fs/promises"
import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys, MedusaError } from "@medusajs/framework/utils"
import { updateProductsWorkflow } from "@medusajs/medusa/core-flows"

type StoryBlock = Record<string, unknown> & { videos: string[] }
type DetailMetadata = Record<string, unknown> & { videos?: string[]; story?: StoryBlock[] }

export default async function removeProductDetailVideos({ container }: ExecArgs) {
  const listPath = process.env.SHOKZ_REMOVED_VIDEO_LIST
  if (!listPath) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "SHOKZ_REMOVED_VIDEO_LIST is required")
  }

  const urls = JSON.parse(await readFile(listPath, "utf8")) as string[]
  const removed = new Set(urls)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fields = ["id", "metadata", "thumbnail", "images.url", "variants.metadata"]
  const { data: products } = await query.graph({ entity: "product", fields })
  const changes = products.flatMap((product) => {
    const metadata = product.metadata as DetailMetadata | null
    const serialized = JSON.stringify(metadata)
    if (!metadata || !urls.some((url) => serialized.includes(url))) return []

    const updated = { ...metadata }
    if (metadata.videos) updated.videos = metadata.videos.filter((url) => !removed.has(url))
    if (metadata.story) {
      updated.story = metadata.story.map((block) => ({
        ...block,
        videos: block.videos.filter((url) => !removed.has(url)),
      }))
    }
    return [{ id: product.id, metadata: updated }]
  })

  if (changes.length) {
    await updateProductsWorkflow(container).run({ input: { products: changes } })
  }

  // Validate the references before the release removes their files from the persistent media tree.
  const { data: updated } = await query.graph({ entity: "product", fields })
  const serialized = JSON.stringify(updated)
  if (urls.some((url) => serialized.includes(url))) {
    throw new MedusaError(MedusaError.Types.INVALID_DATA, "A removed video still has a product reference")
  }
  container.resolve(ContainerRegistrationKeys.LOGGER).info(`Removed video references from ${changes.length} products`)
}

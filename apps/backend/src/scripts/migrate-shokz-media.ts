import { readFile } from "node:fs/promises"
import path from "node:path"
import type { ExecArgs } from "@medusajs/framework/types"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import { updateProductsWorkflow, updateProductVariantsWorkflow } from "@medusajs/medusa/core-flows"
import { createShokzMediaImporter } from "../lib/shokz-media"
import { publishShokzContent } from "../lib/shokz-content"

export default async function migrateShokzMedia({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const catalog: { products: { handle: string }[] } = JSON.parse(
    await readFile(path.resolve(process.cwd(), "data/catalog.json"), "utf8")
  )
  const { data: products } = await query.graph({
    entity: "product",
    fields: ["id", "handle", "thumbnail", "images.id", "images.url", "metadata", "variants.id", "variants.metadata"],
    filters: { handle: catalog.products.map((product) => product.handle) },
  })
  const importMedia = await createShokzMediaImporter(container)
  let updatedProducts = 0
  let updatedVariants = 0

  for (const product of products) {
    const media = {
      thumbnail: product.thumbnail,
      images: product.images.map((image) => ({ id: image.id, url: image.url })),
      metadata: product.metadata,
    }
    const imported = await importMedia(media)
    if (JSON.stringify(imported) !== JSON.stringify(media)) {
      await updateProductsWorkflow(container).run({
        input: { products: [{ id: product.id, ...imported }] },
      })
      updatedProducts++
    }
    const variants: { id: string; metadata: Record<string, unknown> | null | undefined }[] = []
    for (const variant of product.variants) {
      const metadata = await importMedia(variant.metadata)
      if (JSON.stringify(metadata) !== JSON.stringify(variant.metadata)) {
        variants.push({ id: variant.id, metadata })
      }
    }
    // 单独更新变体 metadata，避免产品工作流将未传入的变体视为删除。
    if (variants.length) {
      await updateProductVariantsWorkflow(container).run({
        input: { product_variants: variants },
      })
      updatedVariants += variants.length
    }
  }
  await publishShokzContent(importMedia)
  logger.info(`Shokz media migrated: ${updatedProducts} products, ${updatedVariants} variants updated.`)
}

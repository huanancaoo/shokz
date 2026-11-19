import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PAYLOAD_CATALOG_MODULE } from "../../modules/payload-catalog"
import type PayloadCatalogService from "../../modules/payload-catalog/service"

export const mirrorCatalogProductStep = createStep(
  "mirror-catalog-product",
  async ({ id }: { id: string }, { container }) => {
    const catalog = container.resolve<PayloadCatalogService>(
      PAYLOAD_CATALOG_MODULE
    )
    const locking = container.resolve(Modules.LOCKING)
    const query = container.resolve(ContainerRegistrationKeys.QUERY)

    // 回填和事件共用商品锁，并在锁内读取 Medusa 当前状态，避免迟到事件覆盖新数据。
    await locking.execute(`payload-catalog:${id}`, async (signal) => {
      const {
        data: [product],
      } = await query.graph({
        entity: "product",
        fields: ["id", "title", "handle", "thumbnail", "status"],
        filters: { id },
      })
      await catalog.mirror(
        id,
        product?.status === "published"
          ? {
              id,
              title: product.title,
              handle: product.handle,
              thumbnail: product.thumbnail ?? null,
            }
          : null,
        signal
      )
    })

    return new StepResponse()
  }
)

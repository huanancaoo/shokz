import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils"
import { PAYLOAD_CATALOG_MODULE } from "../modules/payload-catalog"
import { SYNC_PAYLOAD_CATALOG } from "../modules/payload-catalog/events"
import type PayloadCatalogService from "../modules/payload-catalog/service"
import { syncPayloadProductWorkflow } from "../workflows/sync-payload-product"

export default async function syncPayloadCatalog({
  container,
}: SubscriberArgs) {
  const catalog = container.resolve<PayloadCatalogService>(
    PAYLOAD_CATALOG_MODULE
  )
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const lock = container.resolve(Modules.LOCKING)
  const workflow = syncPayloadProductWorkflow(container)

  await lock.execute("payload-catalog:full-sync", async () => {
    // 同时检查 CMS 已有的 ID，补齐停机期间漏掉的下架和删除事件。
    const remaining = new Set(await catalog.listIds())
    const pageSize = 100
    let skip = 0
    for (;;) {
      const { data } = await query.graph({
        entity: "product",
        fields: ["id"],
        pagination: { skip, take: pageSize, order: { id: "ASC" } },
      })
      for (const { id } of data) {
        await workflow.run({ input: { id } })
        remaining.delete(id)
      }
      if (data.length < pageSize) break
      skip += pageSize
    }
    for (const id of remaining) {
      await workflow.run({ input: { id } })
    }
  })
}

export const config: SubscriberConfig = { event: SYNC_PAYLOAD_CATALOG }

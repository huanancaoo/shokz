import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { PAYLOAD_CATALOG_MODULE } from "../modules/payload-catalog"
import { syncPayloadProductWorkflow } from "../workflows/sync-payload-product"

export default async function syncPayloadProduct({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  if (!container.hasRegistration(PAYLOAD_CATALOG_MODULE)) return
  await syncPayloadProductWorkflow(container).run({ input: { id: data.id } })
}

export const config: SubscriberConfig = {
  event: ["product.created", "product.updated", "product.deleted"],
}

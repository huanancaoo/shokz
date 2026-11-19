import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"
import { PAYLOAD_CATALOG_MODULE } from "../../../../modules/payload-catalog"
import { SYNC_PAYLOAD_CATALOG } from "../../../../modules/payload-catalog/events"

export const POST = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  if (!req.scope.hasRegistration(PAYLOAD_CATALOG_MODULE)) {
    res
      .status(503)
      .json({ message: "Set PAYLOAD_CATALOG_URL and PAYLOAD_CATALOG_API_KEY" })
    return
  }
  await req.scope
    .resolve(Modules.EVENT_BUS)
    .emit({ name: SYNC_PAYLOAD_CATALOG, data: {} })
  res.status(202).json({ queued: true })
}

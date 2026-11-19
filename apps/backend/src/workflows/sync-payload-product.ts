import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { mirrorCatalogProductStep } from "./steps/mirror-catalog-product"

export const syncPayloadProductWorkflow = createWorkflow(
  "sync-payload-product",
  function (input: { id: string }) {
    mirrorCatalogProductStep(input)
    return new WorkflowResponse({})
  }
)

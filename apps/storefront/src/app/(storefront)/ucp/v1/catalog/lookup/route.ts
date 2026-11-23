import { runRestJsonOperation } from "@lib/ucp/agent"
import { lookupCatalog } from "@lib/ucp/operations"
import { CATALOG_LOOKUP } from "@lib/ucp/ucp"

export const POST = (request: Request) =>
  runRestJsonOperation(request, CATALOG_LOOKUP, (body) =>
    lookupCatalog(request, body)
  )

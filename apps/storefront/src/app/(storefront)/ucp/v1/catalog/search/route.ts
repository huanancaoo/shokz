import { runRestJsonOperation } from "@lib/ucp/agent"
import { searchCatalog } from "@lib/ucp/operations"
import { CATALOG_SEARCH } from "@lib/ucp/ucp"

export const POST = (request: Request) =>
  runRestJsonOperation(request, CATALOG_SEARCH, (body) =>
    searchCatalog(request, body)
  )

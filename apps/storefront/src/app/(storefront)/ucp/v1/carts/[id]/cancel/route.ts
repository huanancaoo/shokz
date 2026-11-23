import { runRestOperation } from "@lib/ucp/agent"
import { cancelCart } from "@lib/ucp/operations"
import { CART } from "@lib/ucp/ucp"

export const POST = (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) =>
  runRestOperation(request, CART, async () =>
    cancelCart(request, (await params).id)
  )

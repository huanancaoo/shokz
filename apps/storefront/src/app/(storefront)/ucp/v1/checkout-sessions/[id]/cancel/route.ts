import { runRestOperation } from "@lib/ucp/agent"
import { cancelCheckout } from "@lib/ucp/operations"
import { CHECKOUT } from "@lib/ucp/ucp"

export const POST = (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) =>
  runRestOperation(request, CHECKOUT, async () =>
    cancelCheckout(request, (await params).id)
  )

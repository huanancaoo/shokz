import { runRestOperation } from "@lib/ucp/agent"
import { completeCheckout } from "@lib/ucp/operations"
import { CHECKOUT } from "@lib/ucp/ucp"

export const POST = (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) =>
  runRestOperation(request, CHECKOUT, async () =>
    completeCheckout(request, (await params).id)
  )

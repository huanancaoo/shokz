import { runRestJsonOperation, runRestOperation } from "@lib/ucp/agent"
import { getCheckout, updateCheckout } from "@lib/ucp/operations"
import { CHECKOUT } from "@lib/ucp/ucp"

type Context = { params: Promise<{ id: string }> }

export const GET = (request: Request, { params }: Context) =>
  runRestOperation(request, CHECKOUT, async () =>
    getCheckout(request, (await params).id)
  )

export const PUT = (request: Request, { params }: Context) =>
  runRestJsonOperation(request, CHECKOUT, async (body) =>
    updateCheckout(request, (await params).id, body)
  )

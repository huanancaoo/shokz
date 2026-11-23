import { runRestJsonOperation, runRestOperation } from "@lib/ucp/agent"
import { getCart, updateCart } from "@lib/ucp/operations"
import { CART } from "@lib/ucp/ucp"

type Context = { params: Promise<{ id: string }> }

export const GET = (request: Request, { params }: Context) =>
  runRestOperation(request, CART, async () =>
    getCart(request, (await params).id)
  )

export const PUT = (request: Request, { params }: Context) =>
  runRestJsonOperation(request, CART, async (body) =>
    updateCart(request, (await params).id, body)
  )

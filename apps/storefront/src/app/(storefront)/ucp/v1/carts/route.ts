import { runRestJsonOperation, scopedIdempotencyKey } from "@lib/ucp/agent"
import { createCart } from "@lib/ucp/operations"
import { CART } from "@lib/ucp/ucp"

export const POST = (request: Request) =>
  runRestJsonOperation(request, CART, (body, profile) =>
    createCart(
      request,
      body,
      scopedIdempotencyKey(profile, request.headers.get("Idempotency-Key"))
    )
  )

import { runRestJsonOperation, scopedIdempotencyKey } from "@lib/ucp/agent"
import { createCheckout } from "@lib/ucp/operations"
import { CHECKOUT } from "@lib/ucp/ucp"

export const POST = (request: Request) =>
  runRestJsonOperation(request, CHECKOUT, (body, profile) =>
    createCheckout(
      request,
      body,
      scopedIdempotencyKey(profile, request.headers.get("Idempotency-Key"))
    )
  )

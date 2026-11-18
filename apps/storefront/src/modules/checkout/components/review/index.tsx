"use client"

import { InformationCircleIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { HttpTypes } from "@medusajs/types"
import { CheckoutStep } from "@modules/checkout/components/checkout-step"
import PaymentButton from "@modules/checkout/components/payment-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useSearchParams } from "next/navigation"

export default function Review({ cart }: { cart: HttpTypes.StoreCart }) {
  const open = useSearchParams().get("step") === "review"
  const previousStepsCompleted =
    cart.shipping_address &&
    (cart.shipping_methods?.length ?? 0) > 0 &&
    cart.payment_collection

  return (
    <CheckoutStep step="review" active={open}>
      {open && previousStepsCompleted && (
        <div className="grid gap-4">
          <p className="flex items-start gap-2.5 rounded-xl bg-accent p-4 text-sm leading-relaxed text-accent-foreground">
            <HugeiconsIcon
              icon={InformationCircleIcon}
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            테스트 주문입니다. 실제 결제나 배송이 진행되지 않습니다.
          </p>
          <p className="break-keep text-sm leading-relaxed text-muted-foreground">
            주문을 확정하면{" "}
            <LocalizedClientLink
              href="/pages/terms"
              className="font-medium text-foreground underline underline-offset-4"
            >
              이용약관
            </LocalizedClientLink>
            ,{" "}
            <LocalizedClientLink
              href="/returns"
              className="font-medium text-foreground underline underline-offset-4"
            >
              교환 및 반품 안내
            </LocalizedClientLink>
            ,{" "}
            <LocalizedClientLink
              href="/pages/privacy"
              className="font-medium text-foreground underline underline-offset-4"
            >
              개인정보처리방침
            </LocalizedClientLink>
            에 동의합니다.
          </p>
          <PaymentButton cart={cart} data-testid="submit-order-button" />
        </div>
      )}
    </CheckoutStep>
  )
}

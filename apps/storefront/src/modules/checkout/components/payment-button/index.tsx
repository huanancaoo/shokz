"use client"

import { useRef, useState } from "react"
import type { HttpTypes } from "@medusajs/types"
import { placeOrder } from "@lib/data/cart"
import { Button } from "@modules/common/components/ui/button"
import { Spinner } from "@modules/common/components/ui/spinner"
import ErrorMessage from "../error-message"

export default function PaymentButton({
  cart,
  "data-testid": testId,
}: {
  cart: HttpTypes.StoreCart
  "data-testid": string
}) {
  const lock = useRef(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const ready =
    cart.shipping_address &&
    cart.billing_address &&
    cart.email &&
    cart.shipping_methods?.length &&
    cart.payment_collection?.payment_sessions?.some(
      (session) => session.provider_id === "pp_system_default"
    )

  async function submit() {
    // React 禁用按钮前可能收到第二次点击，因此同步锁住同一次订单提交。
    if (lock.current) return
    lock.current = true
    setPending(true)
    setError(null)
    try {
      await placeOrder()
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error))
      lock.current = false
      setPending(false)
    }
  }

  return (
    <>
      <Button
        size="lg"
        className="w-full"
        onClick={submit}
        disabled={!ready || pending}
        data-testid={testId}
      >
        {pending && <Spinner data-icon="inline-start" />}테스트 주문 확정
      </Button>
      <ErrorMessage error={error} data-testid="manual-payment-error-message" />
    </>
  )
}

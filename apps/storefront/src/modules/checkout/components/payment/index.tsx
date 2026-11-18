"use client"

import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { initiatePaymentSession } from "@lib/data/cart"
import type { HttpTypes } from "@medusajs/types"
import { CheckoutChoice } from "@modules/checkout/components/checkout-choice"
import { CheckoutStep } from "@modules/checkout/components/checkout-step"
import ErrorMessage from "@modules/checkout/components/error-message"
import { Button } from "@modules/common/components/ui/button"
import { RadioGroup } from "@modules/common/components/ui/radio-group"
import { Spinner } from "@modules/common/components/ui/spinner"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

const testPaymentProvider = "pp_system_default"

export default function Payment({
  cart,
  availablePaymentMethods,
}: {
  cart: HttpTypes.StoreCart
  availablePaymentMethods: { id: string }[] | null
}) {
  const session = cart.payment_collection?.payment_sessions?.find(
    (item) => item.provider_id === testPaymentProvider
  )
  const [method, setMethod] = useState(session?.provider_id ?? "")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  const open = useSearchParams().get("step") === "payment"
  const enabled = availablePaymentMethods?.some(
    (item) => item.id === testPaymentProvider
  )

  async function submit() {
    setPending(true)
    setError(null)
    try {
      if (!session) {
        await initiatePaymentSession(cart, { provider_id: testPaymentProvider })
      }
      router.push(`${pathname}?step=review`, { scroll: false })
    } catch {
      setError("결제 방법을 저장하지 못했습니다. 다시 시도해 주세요.")
    } finally {
      setPending(false)
    }
  }

  return (
    <CheckoutStep step="payment" active={open} completed={Boolean(session)}>
      {open ? (
        <div className="grid gap-4">
          {enabled ? (
            <RadioGroup
              value={method}
              onValueChange={(value) => setMethod(String(value))}
              disabled={pending}
              aria-labelledby="checkout-payment-title"
            >
              <CheckoutChoice
                id="system-payment"
                value={testPaymentProvider}
                label="테스트 결제"
                description="카드 정보 입력 없이 테스트 주문을 진행합니다. 실제로 청구되지 않습니다."
              />
            </RadioGroup>
          ) : (
            <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
              {availablePaymentMethods
                ? "선택할 수 있는 결제 방법이 없습니다."
                : "결제 방법을 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요."}
            </p>
          )}
          <ErrorMessage
            error={error}
            data-testid="payment-option-error-message"
          />
          <Button
            size="lg"
            className="w-full font-semibold"
            onClick={submit}
            disabled={!enabled || !method || pending}
            data-testid="submit-payment-button"
          >
            {pending && <Spinner data-icon="inline-start" />}
            주문 확인으로 계속
            <HugeiconsIcon icon={ArrowRight01Icon} aria-hidden="true" />
          </Button>
        </div>
      ) : session ? (
        <p
          className="rounded-xl bg-muted p-4 text-sm"
          data-testid="payment-method-summary"
        >
          테스트 결제{" "}
          <span className="text-muted-foreground">· 실제 청구 없음</span>
        </p>
      ) : null}
    </CheckoutStep>
  )
}

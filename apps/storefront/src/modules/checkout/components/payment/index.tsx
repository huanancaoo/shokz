"use client"

import { useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { HttpTypes } from "@medusajs/types"
import { initiatePaymentSession } from "@lib/data/cart"
import { Button } from "@modules/common/components/ui/button"
import {
  RadioGroup,
  RadioGroupItem,
} from "@modules/common/components/ui/radio-group"
import {
  Field,
  FieldLabel,
  FieldDescription,
} from "@modules/common/components/ui/field"
import { Alert, AlertDescription } from "@modules/common/components/ui/alert"
import { Spinner } from "@modules/common/components/ui/spinner"
import { Separator } from "@modules/common/components/ui/separator"

export default function Payment({
  cart,
  availablePaymentMethods,
}: {
  cart: HttpTypes.StoreCart
  availablePaymentMethods: { id: string }[]
}) {
  const session = cart.payment_collection?.payment_sessions?.find(
    (item) => item.provider_id === "pp_system_default"
  )
  const [method, setMethod] = useState(session?.provider_id ?? "")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const params = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()
  const open = params.get("step") === "payment"
  const enabled = availablePaymentMethods.some(
    (item) => item.id === "pp_system_default"
  )

  async function submit() {
    setPending(true)
    setError("")
    try {
      if (!session)
        await initiatePaymentSession(cart, { provider_id: "pp_system_default" })
      router.push(`${pathname}?step=review`, { scroll: false })
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error))
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="checkout-step">
      <div className="checkout-step-heading">
        <h2>
          <span>03</span> 결제 방법
        </h2>
        {!open && session && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              router.push(`${pathname}?step=payment`, { scroll: false })
            }
          >
            수정
          </Button>
        )}
      </div>
      {open ? (
        <div className="flex flex-col gap-6">
          <RadioGroup
            value={method}
            onValueChange={(value) => setMethod(String(value))}
            aria-label="결제 방법"
          >
            <Field orientation="horizontal" className="payment-choice">
              <RadioGroupItem
                id="system-payment"
                value="pp_system_default"
                disabled={!enabled}
              />
              <div>
                <FieldLabel htmlFor="system-payment">
                  Medusa 테스트 결제
                </FieldLabel>
                <FieldDescription>
                  POC 주문 체험용입니다. 카드 정보나 실제 결제가 필요하지
                  않습니다.
                </FieldDescription>
              </div>
            </Field>
          </RadioGroup>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button
            size="lg"
            onClick={submit}
            disabled={!method || pending}
            data-testid="submit-payment-button"
          >
            {pending && <Spinner data-icon="inline-start" />}주문 내용 확인
          </Button>
        </div>
      ) : (
        session && (
          <p data-testid="payment-method-summary">
            Medusa 테스트 결제 · 실제 청구 없음
          </p>
        )
      )}
      <Separator className="mt-8" />
    </section>
  )
}

"use client"

import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { setShippingMethod } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import type { HttpTypes } from "@medusajs/types"
import { CheckoutChoice } from "@modules/checkout/components/checkout-choice"
import { CheckoutStep } from "@modules/checkout/components/checkout-step"
import ErrorMessage from "@modules/checkout/components/error-message"
import { Button } from "@modules/common/components/ui/button"
import { RadioGroup } from "@modules/common/components/ui/radio-group"
import { Spinner } from "@modules/common/components/ui/spinner"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

export default function Shipping({
  cart,
  availableShippingMethods,
}: {
  cart: HttpTypes.StoreCart
  availableShippingMethods: HttpTypes.StoreCartShippingOption[] | null
}) {
  const saved = cart.shipping_methods?.at(-1)
  const [selected, setSelected] = useState(saved?.shipping_option_id ?? "")
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pathname = usePathname()
  const router = useRouter()
  const open = useSearchParams().get("step") === "delivery"

  async function select(id: string) {
    const previous = selected
    setSelected(id)
    setPending(true)
    setError(null)
    try {
      await setShippingMethod({ cartId: cart.id, shippingMethodId: id })
    } catch {
      setSelected(previous)
      setError("배송 방법을 저장하지 못했습니다. 다시 시도해 주세요.")
    } finally {
      setPending(false)
    }
  }

  function price(amount: number) {
    return convertToLocale({ amount, currency_code: cart.currency_code })
  }

  return (
    <CheckoutStep step="delivery" active={open} completed={Boolean(saved)}>
      {open ? (
        <div className="grid gap-4">
          {availableShippingMethods?.length ? (
            <RadioGroup
              value={selected}
              onValueChange={(value) => select(String(value))}
              disabled={pending}
              aria-labelledby="checkout-delivery-title"
              data-testid="delivery-options-container"
            >
              {availableShippingMethods.map((option) => (
                <CheckoutChoice
                  key={option.id}
                  id={option.id}
                  value={option.id}
                  label={option.name}
                  price={
                    option.amount == null ? undefined : price(option.amount)
                  }
                  testId="delivery-option-radio"
                />
              ))}
            </RadioGroup>
          ) : (
            <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
              {availableShippingMethods
                ? "선택할 수 있는 배송 방법이 없습니다. 배송지를 확인해 주세요."
                : "배송 방법을 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요."}
            </p>
          )}
          <ErrorMessage
            error={error}
            data-testid="delivery-option-error-message"
          />
          <Button
            size="lg"
            className="w-full font-semibold"
            disabled={
              pending ||
              !availableShippingMethods?.some(
                (option) => option.id === selected
              )
            }
            onClick={() =>
              router.push(`${pathname}?step=payment`, { scroll: false })
            }
            data-testid="submit-delivery-option-button"
          >
            {pending && <Spinner data-icon="inline-start" />}
            결제 방법으로 계속
            <HugeiconsIcon icon={ArrowRight01Icon} aria-hidden="true" />
          </Button>
        </div>
      ) : saved ? (
        <div className="flex justify-between gap-3 rounded-xl bg-muted p-4 text-sm">
          <p>{saved.name}</p>
          <p className="shrink-0 font-semibold tabular-nums">
            {price(saved.amount)}
          </p>
        </div>
      ) : null}
    </CheckoutStep>
  )
}

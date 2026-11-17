"use client"

import { useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import type { HttpTypes } from "@medusajs/types"
import { setShippingMethod } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import { Button } from "@modules/common/components/ui/button"
import {
  RadioGroup,
  RadioGroupItem,
} from "@modules/common/components/ui/radio-group"
import { Field, FieldLabel } from "@modules/common/components/ui/field"
import { Spinner } from "@modules/common/components/ui/spinner"
import { Separator } from "@modules/common/components/ui/separator"
import ErrorMessage from "../error-message"

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
    } catch (error) {
      setSelected(previous)
      setError(error instanceof Error ? error.message : String(error))
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="checkout-step">
      <div className="checkout-step-heading">
        <h2>
          <span>02</span> 배송 방법
        </h2>
        {!open && saved && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              router.push(`${pathname}?step=delivery`, { scroll: false })
            }
          >
            수정
          </Button>
        )}
      </div>
      {open ? (
        <div className="flex flex-col gap-6">
          <RadioGroup
            value={selected}
            onValueChange={(value) => select(String(value))}
            disabled={pending}
            aria-label="배송 방법"
            data-testid="delivery-options-container"
          >
            {availableShippingMethods?.map((option) => (
              <Field
                orientation="horizontal"
                key={option.id}
                className="shipping-choice"
              >
                <RadioGroupItem
                  id={option.id}
                  value={option.id}
                  data-testid="delivery-option-radio"
                />
                <FieldLabel htmlFor={option.id} className="flex-1">
                  {option.name}
                </FieldLabel>
                <span>
                  {convertToLocale({
                    amount: option.amount ?? 0,
                    currency_code: cart.currency_code,
                  })}
                </span>
              </Field>
            ))}
          </RadioGroup>
          <ErrorMessage
            error={error}
            data-testid="delivery-option-error-message"
          />
          <Button
            size="lg"
            disabled={!selected || pending}
            onClick={() =>
              router.push(`${pathname}?step=payment`, { scroll: false })
            }
            data-testid="submit-delivery-option-button"
          >
            {pending && <Spinner data-icon="inline-start" />}결제 방법 선택
          </Button>
        </div>
      ) : (
        saved && (
          <p>
            {saved.name} ·{" "}
            {convertToLocale({
              amount: saved.amount,
              currency_code: cart.currency_code,
            })}
          </p>
        )
      )}
      <Separator className="mt-8" />
    </section>
  )
}

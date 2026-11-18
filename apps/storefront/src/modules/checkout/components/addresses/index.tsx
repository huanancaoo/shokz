"use client"

import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { setAddresses } from "@lib/data/cart"
import compareAddresses from "@lib/util/compare-addresses"
import type { HttpTypes } from "@medusajs/types"
import AddressSelect from "@modules/checkout/components/address-select"
import {
  AddressFields,
  getAddressValues,
} from "@modules/checkout/components/address-fields"
import { CheckoutStep } from "@modules/checkout/components/checkout-step"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Checkbox from "@modules/common/components/checkbox"
import Input from "@modules/common/components/input"
import { useSearchParams } from "next/navigation"
import { useActionState, useState } from "react"

type AddressProps = {
  cart: HttpTypes.StoreCart
  customer: HttpTypes.StoreCustomer | null
}

function AddressForm({ cart, customer }: AddressProps) {
  const countries = cart.region?.countries ?? []
  const shippingAddress = cart.shipping_address
  const billingAddress = cart.billing_address
  const countryCode =
    shippingAddress?.country_code ??
    (countries.length === 1 ? countries[0].iso_2 : "")

  // Initialize from the cart when the step opens so total updates keep the current draft.
  const [shipping, setShipping] = useState(() =>
    getAddressValues(shippingAddress, countryCode)
  )
  const [billing, setBilling] = useState(() =>
    getAddressValues(billingAddress, countryCode)
  )
  const [email, setEmail] = useState(cart.email || customer?.email || "")
  const [sameAsBilling, setSameAsBilling] = useState(
    !billingAddress ||
      compareAddresses(
        getAddressValues(shippingAddress),
        getAddressValues(billingAddress)
      )
  )
  const [message, formAction] = useActionState(setAddresses, null)
  const savedAddresses =
    customer?.addresses?.filter((address) =>
      countries.some((country) => country.iso_2 === address.country_code)
    ) ?? []

  return (
    <form action={formAction} className="space-y-5">
      {savedAddresses.length > 0 && (
        <AddressSelect
          addresses={savedAddresses}
          addressInput={shipping}
          onSelect={(address) => setShipping(getAddressValues(address))}
        />
      )}
      <AddressFields
        kind="shipping"
        region={cart.region}
        values={shipping}
        onChange={(field, value) =>
          setShipping((current) => ({ ...current, [field]: value }))
        }
      />

      <fieldset className="border-t pt-4">
        <legend className="sr-only">연락처</legend>
        <p aria-hidden="true" className="mb-3 text-sm font-semibold">
          연락처
        </p>
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          <Input
            label="이메일"
            name="email"
            type="email"
            title="올바른 이메일 주소를 입력해 주세요."
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            data-testid="shipping-email-input"
          />
          <Input
            label="전화번호 (선택)"
            name="shipping_address.phone"
            type="tel"
            autoComplete="shipping tel"
            value={shipping.phone}
            onChange={(event) => {
              const phone = event.target.value
              setShipping((current) => ({ ...current, phone }))
            }}
            data-testid="shipping-phone-input"
          />
        </div>
      </fieldset>

      <div className="rounded-xl border bg-muted px-3 py-3">
        <Checkbox
          label="배송지와 청구지가 같습니다"
          name="same_as_billing"
          checked={sameAsBilling}
          onChange={() => setSameAsBilling((same) => !same)}
          data-testid="billing-address-checkbox"
        />
      </div>

      {!sameAsBilling && (
        <fieldset>
          <legend className="mb-3 text-sm font-semibold">청구지 정보</legend>
          <AddressFields
            kind="billing"
            region={cart.region}
            values={billing}
            onChange={(field, value) =>
              setBilling((current) => ({ ...current, [field]: value }))
            }
          />
        </fieldset>
      )}

      <ErrorMessage
        error={
          message
            ? "배송지 정보를 저장하지 못했습니다. 입력 내용을 확인하고 다시 시도해 주세요."
            : null
        }
        data-testid="address-error-message"
      />
      <SubmitButton
        size="lg"
        className="w-full font-semibold"
        data-testid="submit-address-button"
      >
        배송 방법으로 계속
        <HugeiconsIcon icon={ArrowRight01Icon} aria-hidden="true" />
      </SubmitButton>
    </form>
  )
}

function AddressLines({
  address,
  region,
}: {
  address: HttpTypes.StoreCartAddress
  region: HttpTypes.StoreCart["region"]
}) {
  const country =
    address.country_code === "kr"
      ? "대한민국"
      : region?.countries?.find((item) => item.iso_2 === address.country_code)
          ?.display_name ?? address.country_code?.toUpperCase()
  return (
    <>
      <span className="block text-foreground">
        {[address.last_name, address.first_name].filter(Boolean).join(" ")}
      </span>
      <span className="block">
        {[address.address_1, address.address_2].filter(Boolean).join(" ")}
      </span>
      <span className="block">
        {[address.postal_code, address.province, address.city, country]
          .filter(Boolean)
          .join(" ")}
      </span>
    </>
  )
}

export default function Addresses({ cart, customer }: AddressProps) {
  const open = (useSearchParams().get("step") ?? "address") === "address"
  const shipping = cart.shipping_address
  const billing = cart.billing_address
  const completed = Boolean(shipping?.address_1 && cart.email)
  const sameAsBilling =
    !billing ||
    compareAddresses(getAddressValues(shipping), getAddressValues(billing))

  return (
    <CheckoutStep step="address" active={open} completed={completed}>
      {open ? (
        <AddressForm cart={cart} customer={customer} />
      ) : completed && shipping ? (
        <dl className="grid gap-4 break-words rounded-xl bg-muted p-4 text-sm leading-relaxed sm:grid-cols-3">
          <div data-testid="shipping-address-summary">
            <dt className="mb-1 font-semibold">배송지</dt>
            <dd className="text-muted-foreground">
              <AddressLines address={shipping} region={cart.region} />
            </dd>
          </div>
          <div data-testid="shipping-contact-summary">
            <dt className="mb-1 font-semibold">연락처</dt>
            <dd className="text-muted-foreground">{cart.email}</dd>
            {shipping.phone && (
              <dd className="text-muted-foreground">{shipping.phone}</dd>
            )}
          </div>
          <div data-testid="billing-address-summary">
            <dt className="mb-1 font-semibold">청구지</dt>
            <dd className="text-muted-foreground">
              {sameAsBilling ? (
                "배송지와 동일"
              ) : (
                <AddressLines address={billing} region={cart.region} />
              )}
            </dd>
          </div>
        </dl>
      ) : null}
    </CheckoutStep>
  )
}

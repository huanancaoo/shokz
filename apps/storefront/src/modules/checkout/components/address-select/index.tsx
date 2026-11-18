"use client"

import { useId } from "react"
import type { HttpTypes } from "@medusajs/types"
import { Location01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import compareAddresses from "@lib/util/compare-addresses"
import {
  getAddressValues,
  type AddressValues,
} from "@modules/checkout/components/address-fields"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@modules/common/components/ui/select"
import { Field, FieldLabel } from "@modules/common/components/ui/field"

export default function AddressSelect({
  addresses,
  addressInput,
  onSelect,
}: {
  addresses: HttpTypes.StoreCustomerAddress[]
  addressInput: AddressValues
  onSelect: (address: HttpTypes.StoreCustomerAddress) => void
}) {
  const id = useId()
  const selected = addresses.find((address) =>
    compareAddresses(getAddressValues(address), addressInput)
  )
  const items = addresses.map((address) => ({
    value: address.id,
    label: [
      address.last_name,
      address.first_name,
      "·",
      address.address_1,
      address.address_2,
    ]
      .filter(Boolean)
      .join(" "),
  }))
  return (
    <Field className="rounded-xl border bg-muted p-3 sm:p-4">
      <FieldLabel htmlFor={id} className="items-center">
        <HugeiconsIcon
          icon={Location01Icon}
          className="size-4 text-accent-foreground"
          aria-hidden="true"
        />
        저장된 배송지
      </FieldLabel>
      <Select
        items={items}
        value={selected?.id ?? null}
        onValueChange={(addressId) => {
          const address = addresses.find((item) => item.id === addressId)
          if (address) onSelect(address)
        }}
      >
        <SelectTrigger
          id={id}
          className="w-full"
          data-testid="shipping-address-select"
        >
          <SelectValue placeholder="저장된 배송지를 선택해 주세요" />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          <SelectGroup>
            {items.map((item) => (
              <SelectItem
                key={item.value}
                value={item.value}
                className="min-h-10 [&>span:first-child]:min-w-0 [&>span:first-child]:whitespace-normal"
                data-testid="shipping-address-option"
              >
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  )
}

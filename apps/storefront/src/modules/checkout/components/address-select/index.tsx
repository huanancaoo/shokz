"use client"

import { useMemo } from "react"
import type { HttpTypes } from "@medusajs/types"
import compareAddresses from "@lib/util/compare-addresses"
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
  addressInput: HttpTypes.StoreCartAddress | null
  onSelect: (
    address: HttpTypes.StoreCartAddress | undefined,
    email?: string
  ) => void
}) {
  const selected = useMemo(
    () =>
      addresses.find(
        (address) => addressInput && compareAddresses(address, addressInput)
      ),
    [addresses, addressInput]
  )
  const items = [
    { value: "", label: "저장된 배송지를 선택해 주세요" },
    ...addresses.map((address) => ({
      value: address.id,
      label: [address.first_name, address.last_name, address.address_1]
        .filter(Boolean)
        .join(" "),
    })),
  ]
  return (
    <Field>
      <FieldLabel htmlFor="saved-address">저장된 배송지</FieldLabel>
      <Select
        items={items}
        value={selected?.id ?? ""}
        onValueChange={(id) => {
          const address = addresses.find((item) => item.id === id)
          if (address) onSelect(address as HttpTypes.StoreCartAddress)
        }}
      >
        <SelectTrigger
          id="saved-address"
          className="w-full"
          data-testid="shipping-address-select"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          <SelectGroup>
            {items.map((item) => (
              <SelectItem
                key={item.value}
                value={item.value}
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

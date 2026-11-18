"use client"

import { SelectControl } from "@modules/common/components/ui/select-control"

export default function CartItemSelect({
  value,
  maxQuantity,
  disabled,
  onChange,
}: {
  value: number
  maxQuantity: number
  disabled?: boolean
  onChange: (quantity: number) => void
}) {
  const items = Array.from({ length: maxQuantity }, (_, index) => {
    const quantity = String(index + 1)
    return { value: quantity, label: quantity }
  })

  return (
    <SelectControl
      value={String(value)}
      items={items}
      disabled={disabled}
      onValueChange={(quantity) => {
        if (quantity) onChange(Number(quantity))
      }}
      aria-label="수량"
      className="w-[4.5rem]"
      data-testid="product-select-button"
    />
  )
}

"use client"

import { useId } from "react"
import type { HttpTypes } from "@medusajs/types"
import { getCountryOptions } from "@lib/util/country-options"
import {
  SelectControl,
  type SelectControlProps,
} from "@modules/common/components/ui/select-control"
import { Field, FieldLabel } from "@modules/common/components/ui/field"

export default function CountrySelect({
  region,
  required,
  ...props
}: Omit<SelectControlProps, "items" | "id"> & {
  region?: HttpTypes.StoreRegion
}) {
  const id = useId()
  const items = getCountryOptions(region?.countries)

  return (
    <Field>
      <FieldLabel htmlFor={id}>
        국가 / 지역
        {required && <span aria-hidden="true">*</span>}
      </FieldLabel>
      <SelectControl
        id={id}
        items={items}
        required={required}
        placeholder="국가 선택"
        {...props}
      />
    </Field>
  )
}

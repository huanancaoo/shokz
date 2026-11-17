"use client"

import { forwardRef, useId } from "react"
import type { SelectHTMLAttributes } from "react"
import type { HttpTypes } from "@medusajs/types"
import {
  NativeSelect,
  NativeSelectOption,
} from "@modules/common/components/ui/native-select"
import { Field, FieldLabel } from "@modules/common/components/ui/field"

const CountrySelect = forwardRef<
  HTMLSelectElement,
  Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> & {
    region?: HttpTypes.StoreRegion
    placeholder?: string
  }
>(({ region, placeholder = "국가 / 지역", id, ...props }, ref) => {
  const uid = useId()
  return (
    <Field>
      <FieldLabel htmlFor={id ?? uid}>{placeholder}</FieldLabel>
      <NativeSelect id={id ?? uid} ref={ref} {...props}>
        <NativeSelectOption value="">국가를 선택해 주세요</NativeSelectOption>
        {region?.countries?.map((country) => (
          <NativeSelectOption key={country.iso_2} value={country.iso_2}>
            {country.iso_2 === "kr" ? "대한민국" : country.display_name}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </Field>
  )
})
CountrySelect.displayName = "CountrySelect"
export default CountrySelect

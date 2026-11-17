"use client"

import { useId } from "react"
import { Checkbox } from "@modules/common/components/ui/checkbox"
import { Field, FieldLabel } from "@modules/common/components/ui/field"

export default function CheckboxWithLabel({
  checked = true,
  onChange,
  label,
  name,
  "data-testid": testId,
}: {
  checked?: boolean
  onChange?: () => void
  label: string
  name?: string
  "data-testid"?: string
}) {
  const id = useId()
  return (
    <Field orientation="horizontal">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        name={name}
        data-testid={testId}
      />
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
    </Field>
  )
}

"use client"

import {
  RadioGroup,
  RadioGroupItem,
} from "@modules/common/components/ui/radio-group"
import {
  Field,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from "@modules/common/components/ui/field"

export default function FilterRadioGroup({
  title,
  items,
  value,
  handleChange,
  "data-testid": testId,
}: {
  title: string
  items: { value: string; label: string }[]
  value: string
  handleChange: (value: string) => void
  "data-testid"?: string
}) {
  return (
    <FieldSet>
      <FieldLegend>{title}</FieldLegend>
      <RadioGroup
        value={value}
        onValueChange={(value) => handleChange(String(value))}
        data-testid={testId}
      >
        {items.map((item) => (
          <Field orientation="horizontal" key={item.value}>
            <RadioGroupItem id={item.value} value={item.value} />
            <FieldLabel htmlFor={item.value}>{item.label}</FieldLabel>
          </Field>
        ))}
      </RadioGroup>
    </FieldSet>
  )
}

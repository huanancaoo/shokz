"use client"

import { getTranslation } from "@payloadcms/translations"
import { useField, useTranslation } from "@payloadcms/ui"
import type { TextFieldClientProps } from "payload"
import { isThemeColor, validateThemeColor } from "@lib/storefront-theme"
import {
  Field,
  FieldError,
  FieldLabel,
} from "@modules/common/components/ui/field"
import { Input } from "@modules/common/components/ui/input"

export function ThemeColorField({
  field,
  path,
  readOnly,
}: TextFieldClientProps) {
  const { i18n } = useTranslation()
  const { errorMessage, setValue, showError, value } = useField<string>({
    path,
    validate: validateThemeColor,
  })
  const id = `field-${path.replaceAll(".", "-")}`
  const label = getTranslation(field.label ?? field.name, i18n)

  return (
    <Field className="min-w-0" data-invalid={showError}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          aria-label={label + "选色"}
          className="size-8 shrink-0 p-1"
          disabled={readOnly}
          onChange={(event) => setValue(event.currentTarget.value)}
          type="color"
          value={isThemeColor(value) ? value : "#000000"}
        />
        <Input
          aria-describedby={showError ? `${id}-error` : undefined}
          aria-invalid={showError}
          className="max-w-36 font-mono"
          id={id}
          maxLength={7}
          onChange={(event) => setValue(event.currentTarget.value.trim())}
          placeholder="#RRGGBB"
          readOnly={readOnly}
          spellCheck={false}
          value={value ?? ""}
        />
      </div>
      {showError && <FieldError id={`${id}-error`}>{errorMessage}</FieldError>}
    </Field>
  )
}

"use client"

import { forwardRef, useId, useState } from "react"
import type { ComponentProps } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons"
import { Input as InputControl } from "@modules/common/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@modules/common/components/ui/input-group"
import {
  Field,
  FieldLabel,
  FieldError,
} from "@modules/common/components/ui/field"

type InputProps = ComponentProps<"input"> & {
  label: string
  name: string
  topLabel?: string
  errors?: Record<string, unknown>
  touched?: Record<string, unknown>
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ type, label, name, id, topLabel, errors, touched, ...props }, ref) => {
    const uid = useId()
    const inputId = id ?? uid
    const [visible, setVisible] = useState(false)
    const error = touched?.[name] && errors?.[name]
    return (
      <Field data-invalid={Boolean(error)}>
        <FieldLabel htmlFor={inputId}>
          {topLabel ?? label}
          {props.required && <span aria-hidden="true">*</span>}
        </FieldLabel>
        {type === "password" ? (
          <InputGroup className="h-12">
            <InputGroupInput
              ref={ref}
              id={inputId}
              name={name}
              type={visible ? "text" : "password"}
              aria-invalid={Boolean(error)}
              {...props}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                size="icon-sm"
                aria-label={visible ? "비밀번호 숨기기" : "비밀번호 표시"}
                onClick={() => setVisible(!visible)}
              >
                <HugeiconsIcon icon={visible ? ViewOffIcon : ViewIcon} />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        ) : (
          <InputControl
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            aria-invalid={Boolean(error)}
            {...props}
          />
        )}
        {Boolean(error) && <FieldError>{String(error)}</FieldError>}
      </Field>
    )
  }
)
Input.displayName = "Input"
export default Input

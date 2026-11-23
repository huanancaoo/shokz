"use client"

import { forwardRef, useId, useState } from "react"
import type { ComponentProps } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons"
import { Input as InputControl } from "@modules/common/components/ui/input"
import { InputGroup } from "@modules/common/components/ui/input-group"
import { Button } from "@modules/common/components/ui/button"
import { cn } from "@lib/utils"
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
  (
    { type, label, name, id, topLabel, errors, touched, className, ...props },
    ref
  ) => {
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
          <InputGroup className="h-12 min-h-12 w-full rounded-[calc(10px*var(--storefront-radius-scale))] border border-input bg-card transition-[border-color,box-shadow] focus-within:border-primary focus-within:ring-[3px] focus-within:ring-ring/10 has-[[aria-invalid=true]]:border-destructive has-[:disabled]:bg-[#f1f0ed] has-[:disabled]:opacity-60">
            <InputControl
              ref={ref}
              id={inputId}
              name={name}
              type={visible ? "text" : "password"}
              data-slot="input-group-control"
              aria-invalid={Boolean(error)}
              className={cn(
                "h-[46px] min-w-0 flex-1 rounded-[inherit] border-0 bg-transparent px-3.5 py-3 text-sm text-foreground shadow-none outline-none ring-0 placeholder:text-[#77736f] focus-visible:ring-0 aria-[invalid=true]:ring-0 disabled:bg-transparent max-md:text-base",
                className
              )}
              {...props}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mr-0.5 grid size-11 shrink-0 place-items-center rounded-[calc(7px*var(--storefront-radius-scale))] border-0 bg-transparent text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#c34400] disabled:cursor-not-allowed"
              aria-label={visible ? "비밀번호 숨기기" : "비밀번호 표시"}
              aria-pressed={visible}
              aria-controls={inputId}
              disabled={props.disabled}
              onClick={() => setVisible(!visible)}
            >
              <HugeiconsIcon
                icon={visible ? ViewOffIcon : ViewIcon}
                size={20}
                aria-hidden="true"
              />
            </Button>
          </InputGroup>
        ) : (
          <InputControl
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            className={className}
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

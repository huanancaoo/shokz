"use client"

import { useId, useState, type CSSProperties, type FormEvent } from "react"
import type { Form } from "@/payload-types"
import CmsRichText from "@modules/common/components/cms-rich-text"
import { Button } from "@modules/common/components/ui/button"
import { Checkbox } from "@modules/common/components/ui/checkbox"
import { Field, FieldLabel } from "@modules/common/components/ui/field"
import { Input } from "@modules/common/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@modules/common/components/ui/radio-group"
import { SelectControl } from "@modules/common/components/ui/select-control"
import { Textarea } from "@modules/common/components/ui/textarea"

type FormField = NonNullable<Form["fields"]>[number]

function FormInput({ field, id }: { field: Exclude<FormField, { blockType: "message" }>; id: string }) {
  const { name, label, required } = field
  const props = { id, name, required: Boolean(required) }
  const defaultValue = "defaultValue" in field ? field.defaultValue : undefined
  const textValue = typeof defaultValue === "boolean" ? undefined : defaultValue ?? undefined

  switch (field.blockType) {
    case "checkbox":
      return <Checkbox {...props} defaultChecked={Boolean(defaultValue)} />
    case "textarea":
      return <Textarea {...props} defaultValue={textValue} rows={4} />
    case "select":
      return (
        <SelectControl
          {...props}
          items={field.options ?? []}
          defaultValue={field.defaultValue ?? undefined}
          placeholder={field.placeholder ?? undefined}
        />
      )
    case "radio":
      return (
        <RadioGroup name={name} aria-label={label || name} required={props.required} defaultValue={field.defaultValue ?? undefined}>
          {field.options?.map((option, index) => (
            <Field key={option.value} orientation="horizontal">
              <RadioGroupItem id={`${id}-${index}`} value={option.value} />
              <FieldLabel htmlFor={`${id}-${index}`}>{option.label}</FieldLabel>
            </Field>
          ))}
        </RadioGroup>
      )
    case "upload":
      return <Input {...props} type="file" multiple={Boolean(field.multiple)} accept={field.mimeTypes?.map(({ mimeType }) => mimeType).join(",")} />
    case "country":
      return <Input {...props} autoComplete="country-name" />
    case "state":
      return <Input {...props} autoComplete="address-level1" />
    case "date":
      return <Input {...props} type="date" defaultValue={field.defaultValue?.slice(0, 10)} />
    case "number":
      return <Input {...props} type="number" step="any" defaultValue={field.defaultValue ?? undefined} />
    default:
      return <Input {...props} type={field.blockType} defaultValue={textValue} />
  }
}

export default function ContentForm({
  countryCode,
  endpoint,
  fields,
  submitLabel,
  confirmation,
  preview,
}: {
  countryCode: string
  endpoint: string
  fields: Form["fields"]
  submitLabel: Form["submitButtonLabel"]
  confirmation: Form["confirmationMessage"]
  preview: boolean
}) {
  const id = useId()
  const [pending, setPending] = useState(false)
  const [complete, setComplete] = useState(false)
  const [error, setError] = useState("")

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (preview || pending) return
    const data = new FormData(event.currentTarget)
    setPending(true)
    setError("")

    try {
      const response = await fetch(endpoint, { method: "POST", body: data })
      const result = await response.json()
      if (!response.ok) {
        setError(result.message)
        return
      }
      if (result.redirect) window.location.assign(result.redirect)
      else setComplete(true)
    } catch {
      setError("제출하지 못했습니다. 다시 시도해 주세요.")
    } finally {
      setPending(false)
    }
  }

  if (complete) {
    return (
      <div className="my-5 rounded-lg border border-border bg-card p-5" role="status">
        {confirmation ? <CmsRichText data={confirmation} countryCode={countryCode} /> : "제출이 완료되었습니다."}
      </div>
    )
  }

  return (
    <form className="mt-5 rounded-lg border border-border bg-card p-5 sm:p-6" onSubmit={submit}>
      <fieldset disabled={preview || pending} className="-mx-2 flex flex-wrap gap-y-4">
        {(fields ?? []).map((field, index) => {
          if (field.blockType === "message") {
            return field.message && (
              <div key={field.id ?? index} className="w-full px-2">
                <CmsRichText data={field.message} countryCode={countryCode} />
              </div>
            )
          }
          const fieldID = `${id}-${index}`
          return (
            <Field
              key={field.id ?? index}
              orientation={field.blockType === "checkbox" ? "horizontal" : "vertical"}
              className="w-full px-2 sm:w-[var(--field-width)]"
              style={{ "--field-width": `${field.width || 100}%` } as CSSProperties}
            >
              <FieldLabel htmlFor={field.blockType === "radio" ? undefined : fieldID}>
                {field.label || field.name}
              </FieldLabel>
              <FormInput field={field} id={fieldID} />
            </Field>
          )
        })}
        {error && <p role="alert" className="w-full px-2 text-sm text-destructive">{error}</p>}
        <div className="w-full px-2">
          <Button type="submit" size="lg">
            {pending ? "제출 중…" : submitLabel || "제출"}
          </Button>
        </div>
      </fieldset>
    </form>
  )
}

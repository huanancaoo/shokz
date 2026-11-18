import { cn } from "@lib/utils"
import { Field, FieldLabel } from "@modules/common/components/ui/field"
import { RadioGroupItem } from "@modules/common/components/ui/radio-group"

export function CheckoutChoice({
  id,
  value,
  label,
  description,
  price,
  testId,
}: {
  id: string
  value: string
  label: string
  description?: string
  price?: string
  testId?: string
}) {
  return (
    <Field
      orientation="horizontal"
      className="relative gap-3 rounded-xl border p-4 transition-colors has-[[aria-checked=true]]:border-primary has-[[aria-checked=true]]:bg-accent hover:border-input"
    >
      <RadioGroupItem
        id={id}
        value={value}
        data-testid={testId}
        className="z-10"
      />
      <FieldLabel
        htmlFor={id}
        className={cn(
          "flex min-w-0 flex-1 cursor-pointer items-center justify-between gap-3 after:absolute after:inset-0",
          description && "py-1"
        )}
      >
        <span className="min-w-0">
          <span className="block text-sm font-semibold">{label}</span>
          {description && (
            <span className="mt-1 block text-xs font-normal leading-relaxed text-muted-foreground">
              {description}
            </span>
          )}
        </span>
        {price && (
          <span className="shrink-0 font-semibold tabular-nums">{price}</span>
        )}
      </FieldLabel>
    </Field>
  )
}

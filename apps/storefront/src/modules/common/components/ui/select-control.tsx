"use client"

import { cn } from "@lib/utils"
import type { Select as SelectPrimitive } from "@base-ui/react/select"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select"

export type SelectControlProps = Pick<
  SelectPrimitive.Root.Props<string>,
  | "name"
  | "autoComplete"
  | "disabled"
  | "required"
  | "defaultValue"
  | "value"
  | "onValueChange"
> & {
  items: ReadonlyArray<{ value: string; label: string }>
  id?: string
  placeholder?: string
  className?: string
  "aria-label"?: string
  "data-testid"?: string
}

export function SelectControl({
  items,
  id,
  placeholder,
  className,
  "aria-label": label,
  "data-testid": testId,
  ...props
}: SelectControlProps) {
  return (
    <Select<string> items={items} {...props}>
      <SelectTrigger
        id={id}
        className={cn("w-full min-w-0", className)}
        aria-label={label}
        data-testid={testId}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger={false}>
        <SelectGroup>
          {items.map((item) => (
            <SelectItem
              key={item.value}
              value={item.value}
              className="min-h-10 [&>span:first-child]:min-w-0 [&>span:first-child]:shrink [&>span:first-child]:whitespace-normal"
            >
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

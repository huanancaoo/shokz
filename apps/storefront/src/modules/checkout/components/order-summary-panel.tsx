"use client"

import { ArrowDown01Icon, ShoppingBag01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@lib/utils"
import { Button } from "@modules/common/components/ui/button"
import { useId, useState, type ReactNode } from "react"

export function OrderSummaryPanel({
  total,
  totalLabel,
  quantity,
  children,
}: {
  total: string
  totalLabel: string
  quantity: number
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <aside
      aria-labelledby={`${id}-heading`}
      className="min-w-0 rounded-2xl border bg-background small:sticky small:top-6 small:col-start-2 small:row-start-1"
    >
      <h2
        id={`${id}-heading`}
        className="sr-only small:not-sr-only small:flex small:items-center small:justify-between small:gap-3 small:px-6 small:pb-2 small:pt-5 small:text-xl small:font-semibold small:tracking-tight"
      >
        주문 요약
        <span className="hidden text-xs font-medium text-muted-foreground small:inline">
          {quantity}개
        </span>
      </h2>
      <Button
        variant="ghost"
        className="h-auto min-h-14 w-full justify-start gap-2.5 rounded-2xl px-4 py-2.5 text-left small:hidden"
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((current) => !current)}
        data-testid="order-summary-toggle"
      >
        <HugeiconsIcon
          icon={ShoppingBag01Icon}
          className="size-5"
          aria-hidden="true"
        />
        <span className="flex-1 font-semibold">주문 요약</span>
        <span className="flex flex-col items-end">
          <span className="text-[11px] font-medium leading-tight text-muted-foreground">
            {totalLabel}
          </span>
          <span
            className="text-base font-bold leading-tight tabular-nums"
            aria-live="polite"
          >
            {total}
          </span>
        </span>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
          aria-hidden="true"
        />
      </Button>
      <div
        id={id}
        className={cn(
          "border-t px-4 pb-4 pt-2 small:block small:border-t-0 small:px-6 small:pb-6 small:pt-0",
          !open && "hidden"
        )}
      >
        {children}
      </div>
    </aside>
  )
}

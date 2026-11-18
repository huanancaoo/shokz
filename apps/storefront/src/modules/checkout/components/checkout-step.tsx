"use client"

import { useEffect, useRef, type ReactNode } from "react"
import Link from "next/link"
import { Tick02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cn } from "@lib/utils"
import { buttonVariants } from "@modules/common/components/ui/button"

const steps = {
  address: { number: 1, title: "배송지 정보" },
  delivery: { number: 2, title: "배송 방법" },
  payment: { number: 3, title: "결제 방법" },
  review: { number: 4, title: "주문 확인" },
}

export function CheckoutStep({
  step,
  active,
  completed = false,
  children,
}: {
  step: keyof typeof steps
  active: boolean
  completed?: boolean
  children?: ReactNode
}) {
  const heading = useRef<HTMLHeadingElement>(null)
  const wasActive = useRef(active)
  const { number, title } = steps[step]
  const titleId = `checkout-${step}-title`

  useEffect(() => {
    // Keep focus in the flow when the previous step's action disappears.
    if (active && !wasActive.current) {
      heading.current?.focus({ preventScroll: true })
      heading.current?.scrollIntoView({ block: "nearest", behavior: "instant" })
    }
    wasActive.current = active
  }, [active])

  return (
    <section aria-labelledby={titleId} className="border-b last:border-b-0">
      <div className="flex min-h-[64px] items-center gap-3 px-4 py-4 sm:px-6">
        <span
          aria-hidden="true"
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-full text-sm font-semibold tabular-nums",
            active && "bg-primary text-primary-foreground",
            !active && completed && "bg-accent text-accent-foreground",
            !active && !completed && "border bg-muted text-muted-foreground"
          )}
        >
          {completed && !active ? (
            <HugeiconsIcon icon={Tick02Icon} size={16} />
          ) : (
            number
          )}
        </span>
        <h2
          ref={heading}
          id={titleId}
          aria-current={active ? "step" : undefined}
          tabIndex={active ? -1 : undefined}
          className={cn(
            "min-w-0 flex-1 scroll-m-5 font-semibold tracking-tight outline-none",
            active ? "text-xl sm:text-2xl" : "text-base",
            !active && !completed && "text-muted-foreground"
          )}
        >
          {title}
          {completed && !active && <span className="sr-only"> 완료</span>}
        </h2>
        {!active && completed && (
          <Link
            href={`?step=${step}`}
            scroll={false}
            aria-label={`${title} 수정`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-9 px-3"
            )}
            data-testid={step === "address" ? "edit-address-button" : undefined}
          >
            수정
          </Link>
        )}
      </div>
      {children && <div className="px-4 pb-5 sm:px-6 sm:pb-6">{children}</div>}
    </section>
  )
}

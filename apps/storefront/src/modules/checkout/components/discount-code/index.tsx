"use client"

import {
  ArrowDown01Icon,
  Cancel01Icon,
  Tag01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { applyPromotions } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import { cn } from "@lib/utils"
import type { HttpTypes } from "@medusajs/types"
import ErrorMessage from "@modules/checkout/components/error-message"
import { Button } from "@modules/common/components/ui/button"
import { Input } from "@modules/common/components/ui/input"
import { Spinner } from "@modules/common/components/ui/spinner"
import { useId, useState, useTransition, type FormEvent } from "react"

function formatPromotionValue(
  method: NonNullable<
    HttpTypes.StoreCart["promotions"]
  >[number]["application_method"]
) {
  if (method?.value == null) return ""
  if (method.type === "percentage") return `${method.value}%`
  return method.currency_code
    ? convertToLocale({
        amount: Number(method.value),
        currency_code: method.currency_code,
      })
    : ""
}

export default function DiscountCode({ cart }: { cart: HttpTypes.StoreCart }) {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const promotions = cart.promotions ?? []
  const codes = promotions.flatMap((promotion) =>
    promotion.code ? [promotion.code] : []
  )

  function addCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextCode = code.trim()
    if (!nextCode || pending) return
    setError(null)
    startTransition(async () => {
      try {
        await applyPromotions([...codes, nextCode])
        setCode("")
      } catch {
        setError("프로모션 코드를 적용하지 못했습니다. 코드를 확인해 주세요.")
      }
    })
  }

  function removeCode(removedCode: string) {
    if (pending) return
    setError(null)
    startTransition(async () => {
      try {
        await applyPromotions(codes.filter((item) => item !== removedCode))
      } catch {
        setError("프로모션 코드를 삭제하지 못했습니다. 다시 시도해 주세요.")
      }
    })
  }

  return (
    <div>
      <Button
        type="button"
        variant="ghost"
        className="h-11 w-full justify-start gap-2 px-0 hover:bg-transparent hover:text-accent-foreground aria-expanded:bg-transparent aria-expanded:hover:text-accent-foreground"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((current) => !current)}
        data-testid="add-discount-button"
      >
        <HugeiconsIcon icon={Tag01Icon} aria-hidden="true" />
        <span className="flex-1 text-left">프로모션 코드</span>
        <HugeiconsIcon
          icon={ArrowDown01Icon}
          className={cn(
            "size-4 text-muted-foreground transition-transform",
            open && "rotate-180"
          )}
          aria-hidden="true"
        />
      </Button>
      <div id={id} hidden={!open}>
        <form
          onSubmit={addCode}
          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 pb-3 pt-2"
        >
          <Input
            name="code"
            aria-label="프로모션 코드"
            autoComplete="off"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="코드 입력"
            disabled={pending}
            data-testid="discount-input"
          />
          <Button
            type="submit"
            variant="outline"
            className="h-[46px] px-3"
            disabled={!code.trim() || pending}
            data-testid="discount-apply-button"
          >
            {pending && <Spinner data-icon="inline-start" />}
            적용
          </Button>
        </form>
      </div>
      {promotions.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-2" aria-label="적용된 프로모션">
          {promotions.map((promotion) => (
            <li
              key={promotion.id}
              className="inline-flex max-w-full items-center rounded-lg bg-accent pl-3 text-xs font-semibold text-accent-foreground"
              data-testid="discount-row"
            >
              <span
                className={cn(
                  "min-w-0 break-all",
                  promotion.is_automatic && "py-2 pr-3"
                )}
                data-testid="discount-code"
              >
                {[
                  promotion.code,
                  formatPromotionValue(promotion.application_method),
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
              {!promotion.is_automatic && promotion.code && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-9"
                  disabled={pending}
                  onClick={() => removeCode(promotion.code!)}
                  aria-label={`${promotion.code} 삭제`}
                  data-testid="remove-discount-button"
                >
                  <HugeiconsIcon
                    icon={Cancel01Icon}
                    className="size-4"
                    aria-hidden="true"
                  />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
      <ErrorMessage error={error} data-testid="discount-error-message" />
    </div>
  )
}

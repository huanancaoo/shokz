import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { HttpTypes } from "@medusajs/types"
import { convertToLocale } from "@lib/util/money"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Badge } from "@modules/common/components/ui/badge"
import { buttonVariants } from "@modules/common/components/ui/button"
import { fulfillmentStatusLabel } from "@modules/order/components/order-details"
import Thumbnail from "@modules/products/components/thumbnail"

export default function OrderCard({ order }: { order: HttpTypes.StoreOrder }) {
  const items = order.items ?? []
  const itemCount = items.reduce((count, item) => count + item.quantity, 0)
  const preview = items.slice(0, 3)
  const remaining = items.length - preview.length
  const orderedAt = new Date(order.created_at)

  return (
    <article
      className="rounded-2xl border bg-background"
      data-testid="order-card"
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b p-4 sm:px-5">
        <div>
          <h2 className="font-semibold">
            주문 #<span data-testid="order-display-id">{order.display_id}</span>
          </h2>
          <time
            className="mt-1 block text-sm text-muted-foreground"
            dateTime={orderedAt.toISOString()}
            data-testid="order-created-at"
          >
            {orderedAt.toLocaleDateString("ko-KR")}
          </time>
        </div>
        <Badge variant="secondary">
          {fulfillmentStatusLabel(order.fulfillment_status)}
        </Badge>
      </header>
      {preview.length > 0 && (
        <div className="space-y-3 px-4 py-4 sm:px-5">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {preview.map((item) => (
              <li
                key={item.id}
                className="flex min-w-0 items-center gap-3"
                data-testid="order-item"
              >
                <Thumbnail
                  thumbnail={item.thumbnail}
                  size="square"
                  className="w-12 shrink-0 rounded-lg"
                />
                <div className="min-w-0">
                  <p
                    className="truncate text-sm font-medium"
                    title={item.title}
                    data-testid="item-title"
                  >
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    수량{" "}
                    <span data-testid="item-quantity">{item.quantity}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
          {remaining > 0 && (
            <p className="text-sm text-muted-foreground">
              외 상품 {remaining}종
            </p>
          )}
        </div>
      )}
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-xs text-muted-foreground">
            상품 {itemCount}개
          </span>
          <span
            className="font-semibold tabular-nums"
            data-testid="order-amount"
          >
            {convertToLocale({
              amount: order.total,
              currency_code: order.currency_code,
            })}
          </span>
        </div>
        <LocalizedClientLink
          href={`/account/orders/details/${order.id}`}
          aria-label={`주문 #${order.display_id} 자세히 보기`}
          className={buttonVariants({
            variant: "outline",
            className: "h-11 gap-2 px-3",
          })}
          data-testid="order-details-link"
        >
          자세히 보기 <HugeiconsIcon icon={ArrowRight01Icon} aria-hidden />
        </LocalizedClientLink>
      </footer>
    </article>
  )
}

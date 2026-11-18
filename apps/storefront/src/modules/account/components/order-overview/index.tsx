import { PackageIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { buttonVariants } from "@modules/common/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@modules/common/components/ui/empty"
import OrderCard from "../order-card"

export default function OrderOverview({
  orders,
}: {
  orders: HttpTypes.StoreOrder[]
}) {
  if (orders.length > 0) {
    return (
      <ul className="space-y-4">
        {orders.map((order) => (
          <li key={order.id}>
            <OrderCard order={order} />
          </li>
        ))}
      </ul>
    )
  }

  return (
    <Empty
      className="min-h-56 border border-solid bg-background"
      data-testid="no-orders-container"
    >
      <EmptyHeader>
        <EmptyMedia
          variant="icon"
          className="size-11 rounded-full bg-accent text-accent-foreground [&_svg]:size-5"
        >
          <HugeiconsIcon icon={PackageIcon} aria-hidden />
        </EmptyMedia>
        <EmptyTitle>
          <h2 className="text-base font-semibold">아직 주문 내역이 없어요</h2>
        </EmptyTitle>
        <EmptyDescription>
          주문하시면 이곳에서 배송 상태를 확인할 수 있어요.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <LocalizedClientLink
          href="/"
          className={buttonVariants({
            variant: "outline",
            className: "h-11 px-4",
          })}
          data-testid="continue-shopping-button"
        >
          쇼핑 계속하기
        </LocalizedClientLink>
      </EmptyContent>
    </Empty>
  )
}

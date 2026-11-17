"use client"

import { buttonVariants } from "@modules/common/components/ui/button"

import OrderCard from "../order-card"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

const OrderOverview = ({ orders }: { orders: HttpTypes.StoreOrder[] }) => {
  if (orders?.length) {
    return (
      <div className="flex flex-col gap-y-8 w-full">
        {orders.map((o) => (
          <div
            key={o.id}
            className="border-b border-gray-200 pb-6 last:pb-0 last:border-none"
          >
            <OrderCard order={o} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      className="w-full flex flex-col items-center gap-y-4"
      data-testid="no-orders-container"
    >
      <h2 className="text-large-semi">아직 주문 내역이 없습니다</h2>
      <p className="text-base-regular">
        당신의 일상에 어울리는 샥즈를 찾아보세요.
      </p>
      <div className="mt-4">
        <LocalizedClientLink
          href="/"
          passHref
          className={buttonVariants({ variant: "default" })}
          data-testid="continue-shopping-button"
        >
          쇼핑 계속하기
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default OrderOverview

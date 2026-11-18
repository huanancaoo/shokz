import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

import { HttpTypes } from "@medusajs/types"
import AccountPageHeader from "@modules/account/components/account-page-header"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Help from "@modules/order/components/help"
import Items from "@modules/order/components/items"
import OrderDetails from "@modules/order/components/order-details"
import OrderSummary from "@modules/order/components/order-summary"
import ShippingDetails from "@modules/order/components/shipping-details"
import React from "react"

type OrderDetailsTemplateProps = {
  order: HttpTypes.StoreOrder
}

const OrderDetailsTemplate: React.FC<OrderDetailsTemplateProps> = ({
  order,
}) => {
  return (
    <div className="space-y-5">
      <div>
        <LocalizedClientLink
          href="/account/orders"
          className="mb-1 inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground hover:underline"
          data-testid="back-to-overview-button"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={17} aria-hidden />
          주문 내역으로
        </LocalizedClientLink>
        <AccountPageHeader title="주문 상세" />
      </div>
      <div
        className="space-y-5 rounded-2xl border bg-background p-4 [overflow-wrap:anywhere] sm:p-6"
        data-testid="order-details-container"
      >
        <OrderDetails order={order} showStatus />
        <Items order={order} />
        <ShippingDetails order={order} />
        <OrderSummary order={order} />
        <Help />
      </div>
    </div>
  )
}

export default OrderDetailsTemplate

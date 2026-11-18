import { convertToLocale } from "@lib/util/money"
import type { HttpTypes } from "@medusajs/types"
import ItemsPreviewTemplate from "@modules/cart/templates/preview"
import DiscountCode from "@modules/checkout/components/discount-code"
import { OrderSummaryPanel } from "@modules/checkout/components/order-summary-panel"
import CartTotals from "@modules/common/components/cart-totals"

export default function CheckoutSummary({
  cart,
}: {
  cart: HttpTypes.StoreCart
}) {
  const quantity =
    cart.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0
  const shippingPending = !cart.shipping_methods?.length

  return (
    <OrderSummaryPanel
      total={convertToLocale({
        amount: cart.total ?? 0,
        currency_code: cart.currency_code,
      })}
      totalLabel={shippingPending ? "예상 합계" : "합계"}
      quantity={quantity}
    >
      <ItemsPreviewTemplate cart={cart} />
      <div className="mb-4 border-y">
        <DiscountCode cart={cart} />
      </div>
      <CartTotals totals={cart} shippingPending={shippingPending} />
    </OrderSummaryPanel>
  )
}

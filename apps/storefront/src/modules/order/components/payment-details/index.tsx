import type { HttpTypes } from "@medusajs/types"
import { convertToLocale } from "@lib/util/money"
import { Badge } from "@modules/common/components/ui/badge"
import { Separator } from "@modules/common/components/ui/separator"
import { paymentStatusLabel } from "../order-details"

export default function PaymentDetails({
  order,
}: {
  order: HttpTypes.StoreOrder
}) {
  return (
    <section className="order-payment-details">
      <h2>결제 정보</h2>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-medium">Medusa 테스트 결제</p>
          <p className="text-sm text-muted-foreground mt-2">
            POC 주문입니다. 실제 금액은 청구되지 않습니다.
          </p>
        </div>
        <Badge variant="secondary" data-testid="order-payment-status">
          {paymentStatusLabel(order.payment_status)}
        </Badge>
      </div>
      <p className="mt-6 font-semibold" data-testid="payment-amount">
        주문 금액{" "}
        {convertToLocale({
          amount: order.total,
          currency_code: order.currency_code,
        })}
      </p>
      <Separator className="mt-8" />
    </section>
  )
}

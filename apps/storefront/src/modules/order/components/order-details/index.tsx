import type { HttpTypes } from "@medusajs/types"
import { Badge } from "@modules/common/components/ui/badge"

const paymentLabels: Record<string, string> = {
  not_paid: "미결제",
  awaiting: "결제 대기",
  authorized: "결제 승인",
  partially_authorized: "일부 승인",
  captured: "결제 완료",
  partially_captured: "일부 결제",
  partially_refunded: "일부 환불",
  refunded: "환불 완료",
  canceled: "결제 취소",
  requires_action: "확인 필요",
}
const fulfillmentLabels: Record<string, string> = {
  not_fulfilled: "배송 준비 전",
  partially_fulfilled: "일부 배송 준비",
  fulfilled: "배송 준비 완료",
  partially_shipped: "일부 발송",
  shipped: "발송 완료",
  partially_delivered: "일부 배송 완료",
  delivered: "배송 완료",
  canceled: "취소됨",
}
export const paymentStatusLabel = (status: string) =>
  paymentLabels[status] ?? status
export const fulfillmentStatusLabel = (status: string) =>
  fulfillmentLabels[status] ?? status

export default function OrderDetails({
  order,
  showStatus = true,
}: {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}) {
  return (
    <div className="order-details-intro">
      <p>
        주문 연락 이메일:{" "}
        <strong data-testid="order-email">{order.email}</strong>
      </p>
      <p className="mt-2">
        주문 일자:{" "}
        <span data-testid="order-date">
          {new Date(order.created_at).toLocaleDateString("ko-KR")}
        </span>
      </p>
      <p className="mt-2">
        주문 번호: <strong data-testid="order-id">{order.display_id}</strong>
      </p>
      {showStatus && (
        <div className="flex flex-wrap gap-3 mt-5">
          <Badge variant="secondary" data-testid="order-status">
            {fulfillmentStatusLabel(order.fulfillment_status)}
          </Badge>
          <Badge variant="secondary" data-testid="order-payment-status">
            {paymentStatusLabel(order.payment_status)}
          </Badge>
        </div>
      )}
    </div>
  )
}

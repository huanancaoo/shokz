import { Metadata } from "next"

import AccountPageHeader from "@modules/account/components/account-page-header"
import OrderOverview from "@modules/account/components/order-overview"
import { notFound } from "next/navigation"
import { listOrders } from "@lib/data/orders"
import TransferRequestForm from "@modules/account/components/transfer-request-form"

export const metadata: Metadata = {
  title: "주문 내역 | SHOKZ Korea",
  description: "주문 내역과 주문 상태를 확인하세요.",
}

export default async function Orders() {
  const orders = await listOrders()

  if (!orders) {
    notFound()
  }

  return (
    <div className="space-y-5" data-testid="orders-page-wrapper">
      <AccountPageHeader
        title="주문 내역"
        description="주문 상품과 배송 상태를 확인할 수 있어요."
      />
      <OrderOverview orders={orders} />
      <TransferRequestForm />
    </div>
  )
}

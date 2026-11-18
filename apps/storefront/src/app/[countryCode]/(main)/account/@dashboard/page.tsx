import { Metadata } from "next"

import Overview from "@modules/account/components/overview"
import { notFound } from "next/navigation"
import { retrieveCustomer } from "@lib/data/customer"
import { listOrders } from "@lib/data/orders"

export const metadata: Metadata = {
  title: "내 계정 | SHOKZ Korea",
  description: "회원 정보, 배송지와 최근 주문을 확인하세요.",
}

export default async function OverviewTemplate() {
  const customer = await retrieveCustomer()
  if (!customer) {
    notFound()
  }

  const orders = await listOrders().catch(() => null)
  return <Overview customer={customer} orders={orders} />
}

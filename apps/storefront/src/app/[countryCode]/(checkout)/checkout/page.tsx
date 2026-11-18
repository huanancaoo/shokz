import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { Metadata } from "next"
import { notFound } from "next/navigation"

export const metadata: Metadata = {
  title: "주문하기 | SHOKZ",
}

export default async function Checkout() {
  const cart = await retrieveCart()

  if (!cart) {
    return notFound()
  }

  const customer = await retrieveCustomer()

  return (
    <div className="mx-auto max-w-[44rem] px-4 pb-12 pt-6 md:px-8 small:max-w-[76rem] small:pb-16 small:pt-10">
      <h1 className="mb-5 text-[32px] font-bold leading-tight tracking-[-0.04em] small:mb-7 small:text-[38px]">
        주문하기
      </h1>
      <div className="grid items-start gap-4 small:grid-cols-[minmax(0,1fr)_360px] small:gap-8">
        <CheckoutSummary cart={cart} />
        <CheckoutForm cart={cart} customer={customer} />
      </div>
    </div>
  )
}

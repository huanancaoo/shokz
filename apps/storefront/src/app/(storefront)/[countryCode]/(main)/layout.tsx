import { Metadata } from "next"

import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import { getBaseURL } from "@lib/util/env"
import { listCategories } from "@lib/data/categories"
import CartButton from "@modules/layout/components/cart-button"
import CartMismatchBanner from "@modules/layout/components/cart-mismatch-banner"
import Footer from "@modules/layout/templates/footer"
import Nav from "@modules/layout/templates/nav"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function PageLayout(props: { children: React.ReactNode }) {
  const [customer, cart, categories] = await Promise.all([
    retrieveCustomer(),
    retrieveCart(),
    listCategories(),
  ])

  return (
    <>
      <Nav categories={categories} cart={<CartButton />} />
      {customer && cart && (
        <CartMismatchBanner customer={customer} cart={cart} />
      )}

      {props.children}
      <Footer />
    </>
  )
}

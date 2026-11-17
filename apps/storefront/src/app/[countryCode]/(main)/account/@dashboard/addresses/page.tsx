import { Metadata } from "next"
import { notFound } from "next/navigation"

import AddressBook from "@modules/account/components/address-book"

import { getRegion } from "@lib/data/regions"
import { retrieveCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "배송지 관리 | SHOKZ Korea",
  description: "저장한 배송지를 확인하고 관리하세요.",
}

export default async function Addresses(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params
  const { countryCode } = params
  const customer = await retrieveCustomer()
  const region = await getRegion(countryCode)

  if (!customer || !region) {
    notFound()
  }

  return (
    <div className="w-full" data-testid="addresses-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">배송지 관리</h1>
        <p className="text-base-regular">
          배송지를 저장하고 관리하세요. 저장한 주소는 주문 시 바로 선택할 수
          있습니다.
        </p>
      </div>
      <AddressBook customer={customer} region={region} />
    </div>
  )
}

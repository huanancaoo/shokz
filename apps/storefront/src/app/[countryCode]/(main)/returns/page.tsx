import { Metadata } from "next"

import { getStorePolicies } from "@lib/data/store-policies"
import { PoliciesUnavailable, PolicyPage } from "@modules/policies/templates"

export const dynamic = "force-static"
export const revalidate = 60

export const metadata: Metadata = {
  title: "교환 및 반품 | SHOKZ Korea",
  description: "교환 및 반품 안내를 확인하세요.",
}

export default async function ReturnsPage(props: {
  params: Promise<{ countryCode: string }>
}) {
  const { countryCode } = await props.params
  const { current } = await getStorePolicies(countryCode)

  return (
    <PolicyPage title="교환 및 반품">
      {current ? (
        <>
          <p>
            수령 후 {current.returnWindowDays}일 이내 반품 정책이 적용됩니다. 이
            POC에서는 실제 반품 및 환불 요청을 접수하지 않습니다.
          </p>
          <p>
            {current.freeReturns
              ? "반품 배송비: 무료"
              : "반품 배송비: 고객 부담"}
          </p>
        </>
      ) : (
        <PoliciesUnavailable />
      )}
    </PolicyPage>
  )
}

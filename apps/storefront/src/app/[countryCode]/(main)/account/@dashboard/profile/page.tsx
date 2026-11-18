import { Metadata } from "next"

import AccountPageHeader from "@modules/account/components/account-page-header"
import ProfilePhone from "@modules/account/components/profile-phone"
import ProfileBillingAddress from "@modules/account/components/profile-billing-address"
import ProfileEmail from "@modules/account/components/profile-email"
import ProfileName from "@modules/account/components/profile-name"
import { notFound } from "next/navigation"
import { listRegions } from "@lib/data/regions"
import { retrieveCustomer } from "@lib/data/customer"

export const metadata: Metadata = {
  title: "회원 정보 | SHOKZ Korea",
  description: "샥즈 회원 정보를 확인하고 수정하세요.",
}

export default async function Profile() {
  const [customer, regions] = await Promise.all([
    retrieveCustomer(),
    listRegions(),
  ])

  if (!customer || !regions) {
    notFound()
  }

  return (
    <div className="space-y-5" data-testid="profile-page-wrapper">
      <AccountPageHeader
        title="회원 정보"
        description="연락처와 청구지 주소를 관리할 수 있어요."
      />
      <section
        className="rounded-2xl border bg-background px-4 sm:px-6"
        aria-labelledby="profile-contact-title"
      >
        <h2
          id="profile-contact-title"
          className="pt-5 text-base font-semibold sm:pt-6"
        >
          기본 정보
        </h2>
        <div className="divide-y">
          <ProfileName customer={customer} />
          <ProfileEmail customer={customer} />
          <ProfilePhone customer={customer} />
        </div>
      </section>
      <section
        className="rounded-2xl border bg-background px-4 sm:px-6"
        aria-label="청구지"
      >
        <ProfileBillingAddress customer={customer} regions={regions} />
      </section>
    </div>
  )
}

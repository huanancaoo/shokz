import React from "react"

import UnderlineLink from "@modules/common/components/interactive-link"

import AccountNav from "../components/account-nav"
import { HttpTypes } from "@medusajs/types"

interface AccountLayoutProps {
  customer: HttpTypes.StoreCustomer | null
  children: React.ReactNode
}

const AccountLayout: React.FC<AccountLayoutProps> = ({
  customer,
  children,
}) => {
  // 未登录时没有账户导航，认证页使用独立布局，避免留下空的侧栏网格。
  if (!customer) {
    return (
      <div
        className="bg-[#f5f4ef] px-5 pb-12 pt-9 md:px-8 xl:px-16 max-[900px]:py-[26px] max-[480px]:bg-white max-[480px]:p-0"
        data-testid="account-page"
      >
        {children}
      </div>
    )
  }

  return (
    <div className="flex-1 bg-muted/60" data-testid="account-page">
      <div className="mx-auto max-w-[1248px] px-4 pb-12 pt-5 sm:px-8 sm:pt-10 lg:px-10 lg:pb-16">
        <div className="grid items-start gap-6 small:grid-cols-[216px_minmax(0,1fr)] small:gap-10">
          <AccountNav />
          <div className="min-w-0 space-y-8">
            {children}
            <section className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t pt-5">
              <div className="space-y-1">
                <h2 className="text-sm font-semibold">
                  궁금한 점이 있으신가요?
                </h2>
                <p className="text-sm text-muted-foreground">
                  자주 묻는 질문과 서비스 안내를 확인하세요.
                </p>
              </div>
              <UnderlineLink href="/pages/support">고객지원</UnderlineLink>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AccountLayout

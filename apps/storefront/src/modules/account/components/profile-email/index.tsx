import type { HttpTypes } from "@medusajs/types"
import AccountInfo from "../account-info"

export default function ProfileEmail({
  customer,
}: {
  customer: HttpTypes.StoreCustomer
}) {
  return (
    <AccountInfo
      label="로그인 이메일"
      currentInfo={customer.email}
      data-testid="account-email-editor"
    />
  )
}

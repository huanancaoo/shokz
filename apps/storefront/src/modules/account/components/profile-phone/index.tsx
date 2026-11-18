"use client"

import type { HttpTypes } from "@medusajs/types"
import { updateCustomer } from "@lib/data/customer"
import Input from "@modules/common/components/input"
import AccountInfo from "../account-info"

export default function ProfilePhone({
  customer,
}: {
  customer: HttpTypes.StoreCustomer
}) {
  async function savePhone(data: FormData) {
    await updateCustomer({ phone: data.get("phone") as string })
    return true
  }

  return (
    <AccountInfo
      label="전화번호"
      currentInfo={customer.phone || "등록된 전화번호가 없어요"}
      onSave={savePhone}
      data-testid="account-phone-editor"
    >
      <Input
        label="전화번호"
        name="phone"
        type="tel"
        autoComplete="tel"
        required
        defaultValue={customer.phone ?? ""}
        data-testid="phone-input"
      />
    </AccountInfo>
  )
}

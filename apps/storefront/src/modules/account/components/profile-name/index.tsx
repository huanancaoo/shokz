"use client"

import type { HttpTypes } from "@medusajs/types"
import { updateCustomer } from "@lib/data/customer"
import Input from "@modules/common/components/input"
import AccountInfo from "../account-info"

export default function ProfileName({
  customer,
}: {
  customer: HttpTypes.StoreCustomer
}) {
  const name = [customer.last_name, customer.first_name]
    .filter(Boolean)
    .join(" ")

  async function saveName(data: FormData) {
    await updateCustomer({
      first_name: data.get("first_name") as string,
      last_name: data.get("last_name") as string,
    })
    return true
  }

  return (
    <AccountInfo
      label="이름"
      currentInfo={name || "등록된 이름이 없어요"}
      onSave={saveName}
      data-testid="account-name-editor"
    >
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="성"
          name="last_name"
          autoComplete="family-name"
          required
          defaultValue={customer.last_name ?? ""}
          data-testid="last-name-input"
        />
        <Input
          label="이름"
          name="first_name"
          autoComplete="given-name"
          required
          defaultValue={customer.first_name ?? ""}
          data-testid="first-name-input"
        />
      </div>
    </AccountInfo>
  )
}

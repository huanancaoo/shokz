"use client"

import { useId } from "react"
import type { HttpTypes } from "@medusajs/types"
import { addCustomerAddress, updateCustomerAddress } from "@lib/data/customer"
import { getCountryOptions } from "@lib/util/country-options"
import Input from "@modules/common/components/input"
import { Field, FieldLabel } from "@modules/common/components/ui/field"
import { SelectControl } from "@modules/common/components/ui/select-control"
import AccountInfo from "../account-info"

export default function ProfileBillingAddress({
  customer,
  regions,
}: {
  customer: HttpTypes.StoreCustomer
  regions: HttpTypes.StoreRegion[]
}) {
  const countryId = useId()
  const billing = customer.addresses?.find(
    (address) => address.is_default_billing
  )
  const countries = regions.flatMap((region) =>
    getCountryOptions(region.countries)
  )
  const country = countries.find(({ value }) => value === billing?.country_code)

  async function saveBillingAddress(data: FormData) {
    const result = billing
      ? await updateCustomerAddress({ addressId: billing.id }, data)
      : await addCustomerAddress(
          { isDefaultBilling: true, isDefaultShipping: false },
          data
        )
    return result.success
  }

  return (
    <AccountInfo
      label="청구지 주소"
      currentInfo={
        billing ? (
          <div>
            <p>
              {[billing.last_name, billing.first_name, billing.company]
                .filter(Boolean)
                .join(" ")}
            </p>
            <p>
              {[
                billing.province,
                billing.city,
                billing.address_1,
                billing.address_2,
              ]
                .filter(Boolean)
                .join(" ")}
            </p>
            <p className="text-sm font-normal text-muted-foreground">
              {[
                billing.postal_code,
                country?.label ?? billing.country_code?.toUpperCase(),
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        ) : (
          "등록된 청구지가 없어요"
        )
      }
      onSave={saveBillingAddress}
      data-testid="account-billing-address-editor"
    >
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="성"
          name="last_name"
          autoComplete="billing family-name"
          defaultValue={billing?.last_name ?? ""}
          required
          data-testid="billing-last-name-input"
        />
        <Input
          label="이름"
          name="first_name"
          autoComplete="billing given-name"
          defaultValue={billing?.first_name ?? ""}
          required
          data-testid="billing-first-name-input"
        />
        <Input
          label="전화번호"
          name="phone"
          type="tel"
          autoComplete="billing tel"
          defaultValue={billing?.phone ?? customer.phone ?? ""}
          required
          data-testid="billing-phone-input"
        />
        <Input
          label="회사명 (선택)"
          name="company"
          autoComplete="billing organization"
          defaultValue={billing?.company ?? ""}
          data-testid="billing-company-input"
        />
        <Field>
          <FieldLabel htmlFor={countryId}>
            국가 / 지역 <span aria-hidden="true">*</span>
          </FieldLabel>
          <SelectControl
            id={countryId}
            name="country_code"
            autoComplete="billing country"
            defaultValue={billing?.country_code ?? null}
            placeholder="국가 선택"
            items={countries}
            required
            data-testid="billing-country-code-select"
          />
        </Field>
        <Input
          label="우편번호"
          name="postal_code"
          autoComplete="billing postal-code"
          defaultValue={billing?.postal_code ?? ""}
          required
          data-testid="billing-postcal-code-input"
        />
        <Input
          label="시 / 도 (선택)"
          name="province"
          autoComplete="billing address-level1"
          defaultValue={billing?.province ?? ""}
          data-testid="billing-province-input"
        />
        <Input
          label="시 / 군 / 구"
          name="city"
          autoComplete="billing address-level2"
          defaultValue={billing?.city ?? ""}
          required
          data-testid="billing-city-input"
        />
        <div className="col-span-2">
          <Input
            label="기본 주소"
            name="address_1"
            autoComplete="billing address-line1"
            defaultValue={billing?.address_1 ?? ""}
            required
            data-testid="billing-address-1-input"
          />
        </div>
        <div className="col-span-2">
          <Input
            label="상세 주소 (선택)"
            name="address_2"
            autoComplete="billing address-line2"
            defaultValue={billing?.address_2 ?? ""}
            data-testid="billing-address-2-input"
          />
        </div>
      </div>
    </AccountInfo>
  )
}

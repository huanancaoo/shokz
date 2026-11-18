import type { HttpTypes } from "@medusajs/types"
import Input from "@modules/common/components/input"
import CountrySelect from "@modules/checkout/components/country-select"

export function getAddressValues(
  address:
    | HttpTypes.StoreCartAddress
    | HttpTypes.StoreCustomerAddress
    | null
    | undefined,
  countryCode = ""
) {
  return {
    last_name: address?.last_name ?? "",
    first_name: address?.first_name ?? "",
    country_code: address?.country_code || countryCode,
    postal_code: address?.postal_code ?? "",
    province: address?.province ?? "",
    city: address?.city ?? "",
    address_1: address?.address_1 ?? "",
    address_2: address?.address_2 ?? "",
    company: address?.company ?? "",
    phone: address?.phone ?? "",
  }
}

export type AddressValues = ReturnType<typeof getAddressValues>

export function AddressFields({
  values,
  region,
  kind,
  onChange,
}: {
  values: AddressValues
  region?: HttpTypes.StoreRegion
  kind: "shipping" | "billing"
  onChange: (field: keyof AddressValues, value: string) => void
}) {
  function field(
    key: keyof AddressValues,
    autocomplete: string,
    testId: string
  ) {
    return {
      name: `${kind}_address.${key}`,
      value: values[key],
      autoComplete: `${kind} ${autocomplete}`,
      onChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
      ) => onChange(key, event.target.value),
      "data-testid": `${kind}-${testId}`,
    }
  }

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-4 sm:gap-x-4">
      <Input
        label="성"
        {...field("last_name", "family-name", "last-name-input")}
        required
      />
      <Input
        label="이름"
        {...field("first_name", "given-name", "first-name-input")}
        required
      />
      <CountrySelect
        name={`${kind}_address.country_code`}
        value={values.country_code || null}
        autoComplete={`${kind} country`}
        onValueChange={(value) => onChange("country_code", value ?? "")}
        data-testid={`${kind}-country-select`}
        region={region}
        required
      />
      <Input
        label="우편번호"
        {...field(
          "postal_code",
          "postal-code",
          kind === "shipping" ? "postal-code-input" : "postal-input"
        )}
        inputMode={values.country_code === "kr" ? "numeric" : undefined}
        required
      />
      <Input
        label="시 / 도 (선택)"
        {...field("province", "address-level1", "province-input")}
      />
      <Input
        label={kind === "shipping" ? "시 / 군 / 구" : "시 / 군 / 구 (선택)"}
        {...field("city", "address-level2", "city-input")}
        required={kind === "shipping"}
      />
      <div className="col-span-full">
        <Input
          label="기본 주소"
          {...field("address_1", "address-line1", "address-input")}
          required
        />
      </div>
      <div className="col-span-full sm:col-span-1">
        <Input
          label="상세 주소 (선택)"
          {...field("address_2", "address-line2", "address-line-2-input")}
        />
      </div>
      <div className="col-span-full sm:col-span-1">
        <Input
          label="회사명 (선택)"
          {...field("company", "organization", "company-input")}
        />
      </div>
      {kind === "billing" && (
        <div className="col-span-full sm:col-span-1">
          <Input
            label="전화번호 (선택)"
            type="tel"
            {...field("phone", "tel", "phone-input")}
          />
        </div>
      )}
    </div>
  )
}

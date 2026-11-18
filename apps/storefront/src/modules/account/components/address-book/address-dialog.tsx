"use client"

import { Cancel01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { HttpTypes } from "@medusajs/types"
import { useId, useRef, useState, useTransition } from "react"
import type { FormEvent, ReactElement } from "react"
import { addCustomerAddress, updateCustomerAddress } from "@lib/data/customer"
import Input from "@modules/common/components/input"
import { Alert, AlertDescription } from "@modules/common/components/ui/alert"
import { Button } from "@modules/common/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@modules/common/components/ui/dialog"
import { Field, FieldLabel } from "@modules/common/components/ui/field"
import {
  NativeSelect,
  NativeSelectOption,
} from "@modules/common/components/ui/native-select"
import { Spinner } from "@modules/common/components/ui/spinner"

export default function AddressDialog({
  address,
  region,
  countryCode,
  trigger,
  onSaved,
}: {
  address?: HttpTypes.StoreCustomerAddress
  region: HttpTypes.StoreRegion
  countryCode: string
  trigger: ReactElement
  onSaved: () => void
}) {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState(false)
  const [pending, startTransition] = useTransition()
  const countryId = useId()
  const titleRef = useRef<HTMLHeadingElement>(null)
  const savedCountry = address?.country_code
  // 已保存的地址可能来自其他销售区域，编辑时仍要准确显示它的国家。
  const showSavedCountry =
    savedCountry &&
    !region.countries?.some((country) => country.iso_2 === savedCountry)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)

    // 手动提交避免 React 在服务端返回校验错误时重置未受控字段。
    startTransition(async () => {
      const result = address
        ? await updateCustomerAddress({ addressId: address.id }, formData)
        : await addCustomerAddress({}, formData)

      setError(!result.success)
      if (result.success) {
        setOpen(false)
        onSaved()
      }
    })
  }

  return (
    <Dialog
      open={open}
      disablePointerDismissal
      onOpenChange={(nextOpen) => {
        if (pending) return
        if (nextOpen) setError(false)
        setOpen(nextOpen)
      }}
    >
      <DialogTrigger render={trigger} />
      <DialogContent
        showCloseButton={false}
        initialFocus={titleRef}
        className="flex max-h-[calc(100dvh-1.5rem)] max-w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden rounded-2xl bg-background p-0 shadow-xl sm:max-w-[39rem]"
        data-testid={address ? "edit-address-modal" : "add-address-modal"}
      >
        <DialogHeader className="relative shrink-0 border-b py-4 pl-5 pr-16 sm:pl-7">
          <DialogTitle
            ref={titleRef}
            tabIndex={-1}
            className="text-xl font-bold leading-tight outline-none sm:text-2xl"
          >
            {address ? "배송지 수정" : "배송지 추가"}
          </DialogTitle>
          <DialogDescription className="text-xs">* 필수 항목</DialogDescription>
          <DialogClose
            render={
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-3 top-3"
                disabled={pending}
              />
            }
          >
            <HugeiconsIcon icon={Cancel01Icon} aria-hidden />
            <span className="sr-only">닫기</span>
          </DialogClose>
        </DialogHeader>
        <form
          onSubmit={submit}
          className="flex min-h-0 flex-col"
          aria-busy={pending}
        >
          <div className="min-h-0 space-y-5 overflow-y-auto overscroll-contain px-5 py-5 max-md:[&_input]:text-base max-md:[&_select]:text-base sm:px-7">
            <fieldset disabled={pending} className="min-w-0">
              <legend className="mb-3 text-sm font-semibold">받는 분</legend>
              <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                <Input
                  label="성"
                  name="last_name"
                  autoComplete="shipping family-name"
                  defaultValue={address?.last_name ?? ""}
                  required
                  data-testid="last-name-input"
                />
                <Input
                  label="이름"
                  name="first_name"
                  autoComplete="shipping given-name"
                  defaultValue={address?.first_name ?? ""}
                  required
                  data-testid="first-name-input"
                />
                <Input
                  label="전화번호 (선택)"
                  name="phone"
                  type="tel"
                  autoComplete="shipping tel"
                  defaultValue={address?.phone ?? ""}
                  data-testid="phone-input"
                />
                <Input
                  label="회사명 (선택)"
                  name="company"
                  autoComplete="shipping organization"
                  defaultValue={address?.company ?? ""}
                  data-testid="company-input"
                />
              </div>
            </fieldset>
            <fieldset disabled={pending} className="min-w-0 border-t pt-4">
              <legend className="sr-only">배송 주소</legend>
              <p aria-hidden="true" className="mb-3 text-sm font-semibold">
                배송 주소
              </p>
              <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                <Field>
                  <FieldLabel htmlFor={countryId}>
                    국가 / 지역 <span aria-hidden="true">*</span>
                  </FieldLabel>
                  <NativeSelect
                    id={countryId}
                    className="w-full min-w-0"
                    name="country_code"
                    autoComplete="shipping country"
                    defaultValue={savedCountry ?? countryCode}
                    required
                    data-testid="country-select"
                  >
                    <NativeSelectOption value="">국가 선택</NativeSelectOption>
                    {region.countries?.map((country) => (
                      <NativeSelectOption
                        key={country.iso_2}
                        value={country.iso_2}
                      >
                        {country.iso_2 === "kr"
                          ? "대한민국"
                          : country.display_name}
                      </NativeSelectOption>
                    ))}
                    {showSavedCountry && (
                      <NativeSelectOption value={savedCountry}>
                        {savedCountry.toUpperCase()}
                      </NativeSelectOption>
                    )}
                  </NativeSelect>
                </Field>
                <Input
                  label="우편번호"
                  name="postal_code"
                  autoComplete="shipping postal-code"
                  defaultValue={address?.postal_code ?? ""}
                  required
                  data-testid="postal-code-input"
                />
                <Input
                  label="시 / 도 (선택)"
                  name="province"
                  autoComplete="shipping address-level1"
                  defaultValue={address?.province ?? ""}
                  data-testid="state-input"
                />
                <Input
                  label="시 / 군 / 구"
                  name="city"
                  autoComplete="shipping address-level2"
                  defaultValue={address?.city ?? ""}
                  required
                  data-testid="city-input"
                />
                <div className="col-span-2">
                  <Input
                    label="기본 주소"
                    name="address_1"
                    autoComplete="shipping address-line1"
                    defaultValue={address?.address_1 ?? ""}
                    required
                    data-testid="address-1-input"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    label="상세 주소 (선택)"
                    name="address_2"
                    autoComplete="shipping address-line2"
                    defaultValue={address?.address_2 ?? ""}
                    data-testid="address-2-input"
                  />
                </div>
              </div>
            </fieldset>
          </div>
          <DialogFooter className="mx-0 mb-0 shrink-0 flex-col gap-3 rounded-none bg-background px-5 py-3 sm:flex-col sm:px-7">
            {error && (
              <Alert variant="destructive" data-testid="address-error">
                <AlertDescription>
                  배송지를 저장하지 못했습니다. 다시 시도해 주세요.
                </AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
              <DialogClose
                render={
                  <Button
                    variant="outline"
                    className="h-11 px-5"
                    disabled={pending}
                    data-testid="cancel-button"
                  />
                }
              >
                취소
              </DialogClose>
              <Button
                type="submit"
                className="h-11 min-w-[6rem] px-5"
                disabled={pending}
                data-testid="save-button"
              >
                {pending && <Spinner data-icon="inline-start" />}
                {pending ? "저장 중" : "저장"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

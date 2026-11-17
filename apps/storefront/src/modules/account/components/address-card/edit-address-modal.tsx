"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  Delete02Icon,
  Edit02Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"

import {
  deleteCustomerAddress,
  updateCustomerAddress,
} from "@lib/data/customer"
import useToggleState from "@lib/hooks/use-toggle-state"

import { HttpTypes } from "@medusajs/types"
import CountrySelect from "@modules/checkout/components/country-select"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@modules/common/components/ui/dialog"
import { FieldGroup } from "@modules/common/components/ui/field"
import { cn as clx } from "@lib/utils"
import { Button } from "@modules/common/components/ui/button"
import { Text } from "@/components/typography"

import React, { useActionState, useEffect, useState } from "react"

type EditAddressProps = {
  region: HttpTypes.StoreRegion
  address: HttpTypes.StoreCustomerAddress
  isActive?: boolean
}

const EditAddress: React.FC<EditAddressProps> = ({
  region,
  address,
  isActive = false,
}) => {
  const [removing, setRemoving] = useState(false)
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)

  const [formState, formAction] = useActionState(updateCustomerAddress, {
    success: false,
    error: null,
  } as { success: boolean; error: string | null })

  const close = () => {
    setSuccessState(false)
    closeModal()
  }

  useEffect(() => {
    if (successState) {
      close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [successState])

  useEffect(() => {
    if (formState.success) {
      setSuccessState(true)
    }
  }, [formState])

  const removeAddress = async () => {
    setRemoving(true)
    await deleteCustomerAddress(address.id)
    setRemoving(false)
  }

  return (
    <>
      <div
        className={clx(
          "border rounded-rounded p-5 min-h-[220px] h-full w-full flex flex-col justify-between transition-colors",
          {
            "border-gray-900": isActive,
          }
        )}
        data-testid="address-container"
      >
        <div className="flex flex-col">
          {address.first_name} {address.last_name}
          {address.company && (
            <Text
              className="text-xs text-foreground"
              data-testid="address-company"
            >
              {address.company}
            </Text>
          )}
          <Text className="flex flex-col text-left text-base-regular mt-2">
            <span data-testid="address-address">
              {address.address_1}
              {address.address_2 && <span>, {address.address_2}</span>}
            </span>
            <span data-testid="address-postal-city">
              {address.postal_code}, {address.city}
            </span>
            <span data-testid="address-province-country">
              {address.province && `${address.province}, `}
              {address.country_code?.toUpperCase()}
            </span>
          </Text>
        </div>
        <div className="flex items-center gap-x-4">
          <button
            className="text-small-regular text-foreground flex items-center gap-x-2"
            onClick={open}
            data-testid="address-edit-button"
          >
            <HugeiconsIcon icon={Edit02Icon} />
            수정
          </button>
          <button
            className="text-small-regular text-foreground flex items-center gap-x-2"
            onClick={removeAddress}
            data-testid="address-delete-button"
          >
            {removing ? (
              <HugeiconsIcon icon={Loading03Icon} />
            ) : (
              <HugeiconsIcon icon={Delete02Icon} />
            )}
            삭제
          </button>
        </div>
      </div>

      <Dialog
        open={state}
        onOpenChange={(value) => {
          if (!value) close()
        }}
      >
        <DialogContent
          className="address-dialog"
          data-testid="edit-address-modal"
        >
          <DialogHeader>
            <DialogTitle>배송지 수정</DialogTitle>
          </DialogHeader>
          <form action={formAction}>
            <input type="hidden" name="addressId" value={address.id} />
            <FieldGroup>
              <div className="grid grid-cols-1 gap-y-2">
                <div className="grid grid-cols-2 gap-x-2">
                  <Input
                    label="이름"
                    name="first_name"
                    required
                    autoComplete="given-name"
                    defaultValue={address.first_name || undefined}
                    data-testid="first-name-input"
                  />
                  <Input
                    label="성"
                    name="last_name"
                    required
                    autoComplete="family-name"
                    defaultValue={address.last_name || undefined}
                    data-testid="last-name-input"
                  />
                </div>
                <Input
                  label="회사명 (선택)"
                  name="company"
                  autoComplete="organization"
                  defaultValue={address.company || undefined}
                  data-testid="company-input"
                />
                <Input
                  label="주소"
                  name="address_1"
                  required
                  autoComplete="address-line1"
                  defaultValue={address.address_1 || undefined}
                  data-testid="address-1-input"
                />
                <Input
                  label="상세 주소"
                  name="address_2"
                  autoComplete="address-line2"
                  defaultValue={address.address_2 || undefined}
                  data-testid="address-2-input"
                />
                <div className="grid grid-cols-[144px_1fr] gap-x-2">
                  <Input
                    label="우편번호"
                    name="postal_code"
                    required
                    autoComplete="postal-code"
                    defaultValue={address.postal_code || undefined}
                    data-testid="postal-code-input"
                  />
                  <Input
                    label="시 / 군 / 구"
                    name="city"
                    required
                    autoComplete="locality"
                    defaultValue={address.city || undefined}
                    data-testid="city-input"
                  />
                </div>
                <Input
                  label="도 / 광역시"
                  name="province"
                  autoComplete="address-level1"
                  defaultValue={address.province || undefined}
                  data-testid="state-input"
                />
                <CountrySelect
                  name="country_code"
                  region={region}
                  required
                  autoComplete="country"
                  defaultValue={address.country_code || undefined}
                  data-testid="country-select"
                />
                <Input
                  label="전화번호"
                  name="phone"
                  autoComplete="phone"
                  defaultValue={address.phone || undefined}
                  data-testid="phone-input"
                />
              </div>
              {formState.error && (
                <div className="text-rose-500 text-small-regular py-2">
                  {formState.error}
                </div>
              )}
            </FieldGroup>
            <DialogFooter>
              <div className="flex gap-3 mt-6">
                <Button
                  type="reset"
                  variant="outline"
                  onClick={close}
                  className="h-10"
                  data-testid="cancel-button"
                >
                  취소
                </Button>
                <SubmitButton data-testid="save-button">저장</SubmitButton>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default EditAddress

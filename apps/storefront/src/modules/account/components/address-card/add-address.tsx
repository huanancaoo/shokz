"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Add01Icon } from "@hugeicons/core-free-icons"

import { Button } from "@modules/common/components/ui/button"
import { useActionState, useEffect, useState } from "react"

import { addCustomerAddress } from "@lib/data/customer"
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

const AddAddress = ({
  region,
}: {
  region: HttpTypes.StoreRegion
  addresses: HttpTypes.StoreCustomerAddress[]
}) => {
  const [successState, setSuccessState] = useState(false)
  const { state, open, close: closeModal } = useToggleState(false)

  const [formState, formAction] = useActionState(addCustomerAddress, {
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

  return (
    <>
      <button
        className="border border-border rounded-rounded p-5 min-h-[220px] h-full w-full flex flex-col justify-between"
        onClick={open}
        data-testid="add-address-button"
      >
        <span className="text-base-semi">새 배송지</span>
        <HugeiconsIcon icon={Add01Icon} />
      </button>

      <Dialog
        open={state}
        onOpenChange={(value) => {
          if (!value) close()
        }}
      >
        <DialogContent
          className="address-dialog"
          data-testid="add-address-modal"
        >
          <DialogHeader>
            <DialogTitle>배송지 추가</DialogTitle>
          </DialogHeader>
          <form action={formAction}>
            <FieldGroup>
              <div className="flex flex-col gap-y-2">
                <div className="grid grid-cols-2 gap-x-2">
                  <Input
                    label="이름"
                    name="first_name"
                    required
                    autoComplete="given-name"
                    data-testid="first-name-input"
                  />
                  <Input
                    label="성"
                    name="last_name"
                    required
                    autoComplete="family-name"
                    data-testid="last-name-input"
                  />
                </div>
                <Input
                  label="회사명 (선택)"
                  name="company"
                  autoComplete="organization"
                  data-testid="company-input"
                />
                <Input
                  label="주소"
                  name="address_1"
                  required
                  autoComplete="address-line1"
                  data-testid="address-1-input"
                />
                <Input
                  label="상세 주소"
                  name="address_2"
                  autoComplete="address-line2"
                  data-testid="address-2-input"
                />
                <div className="grid grid-cols-[144px_1fr] gap-x-2">
                  <Input
                    label="우편번호"
                    name="postal_code"
                    required
                    autoComplete="postal-code"
                    data-testid="postal-code-input"
                  />
                  <Input
                    label="시 / 군 / 구"
                    name="city"
                    required
                    autoComplete="locality"
                    data-testid="city-input"
                  />
                </div>
                <Input
                  label="도 / 광역시"
                  name="province"
                  autoComplete="address-level1"
                  data-testid="state-input"
                />
                <CountrySelect
                  region={region}
                  name="country_code"
                  required
                  autoComplete="country"
                  data-testid="country-select"
                />
                <Input
                  label="전화번호"
                  name="phone"
                  autoComplete="phone"
                  data-testid="phone-input"
                />
              </div>
              {formState.error && (
                <div
                  className="text-rose-500 text-small-regular py-2"
                  data-testid="address-error"
                >
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

export default AddAddress

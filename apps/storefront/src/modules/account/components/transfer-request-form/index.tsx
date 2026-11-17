"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import {
  CancelCircleIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"
import { createTransferRequest } from "@lib/data/orders"

import { Heading, Text } from "@/components/typography"
import { Button } from "@modules/common/components/ui/button"
import { Input } from "@modules/common/components/ui/input"
import { useActionState } from "react"
// TODO: Re-add Toaster component when needed
import { SubmitButton } from "@modules/checkout/components/submit-button"
import { useEffect, useState } from "react"

export default function TransferRequestForm() {
  const [showSuccess, setShowSuccess] = useState(false)

  const [state, formAction] = useActionState(createTransferRequest, {
    success: false,
    error: null,
    order: null,
  })

  useEffect(() => {
    if (state.success && state.order) {
      setShowSuccess(true)
    }
  }, [state.success, state.order])

  return (
    <div className="flex flex-col gap-y-4 w-full">
      <div className="grid sm:grid-cols-2 items-center gap-x-8 gap-y-4 w-full">
        <div className="flex flex-col gap-y-1">
          <Heading
            level="h3"
            className="!text-sm font-semibold text-neutral-950"
          >
            주문 연결
          </Heading>
          <p className="text-small-regular text-neutral-500">
            찾으시는 주문이 보이지 않나요?
            <br /> 주문을 계정에 연결하세요.
          </p>
        </div>
        <form
          action={formAction}
          className="flex flex-col gap-y-1 sm:items-end"
        >
          <div className="flex flex-col gap-y-2 w-full">
            <Input className="w-full" name="order_id" placeholder="주문 ID" />
            <SubmitButton
              variant="outline"
              size="sm"
              className="w-fit whitespace-nowrap self-end"
            >
              주문 연결 요청
            </SubmitButton>
          </div>
        </form>
      </div>
      {!state.success && state.error && (
        <Text className="text-base-regular text-rose-500 text-right">
          {state.error}
        </Text>
      )}
      {showSuccess && (
        <div className="flex justify-between p-4 bg-neutral-50 shadow-borders-base w-full self-stretch items-center">
          <div className="flex gap-x-2 items-center">
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              className="w-4 h-4 text-emerald-500"
            />
            <div className="flex flex-col gap-y-1">
              <Text className="text-medim-pl text-neutral-950">
                주문 {state.order?.id} 연결 요청을 생성했습니다.
              </Text>
              <Text className="text-base-regular text-neutral-600">
                이 POC에는 이메일 발송이 설정되어 있지 않습니다.
              </Text>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-fit"
            onClick={() => setShowSuccess(false)}
          >
            <HugeiconsIcon
              icon={CancelCircleIcon}
              className="w-4 h-4 text-neutral-500"
            />
          </Button>
        </div>
      )}
    </div>
  )
}

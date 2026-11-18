"use client"

import { useActionState, useState } from "react"
import { createTransferRequest } from "@lib/data/orders"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { Alert, AlertDescription } from "@modules/common/components/ui/alert"

export default function TransferRequestForm() {
  const [orderId, setOrderId] = useState("")
  const [state, formAction] = useActionState(createTransferRequest, {
    success: false,
    error: null,
    order: null,
  })

  return (
    <section
      aria-labelledby="order-transfer-title"
      className="space-y-4 rounded-2xl border bg-background p-4 sm:p-5"
    >
      <div>
        <h2 id="order-transfer-title" className="text-base font-semibold">
          주문 연결
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          목록에 없는 주문은 주문 ID로 연결을 요청할 수 있어요.
        </p>
      </div>
      <form action={formAction} className="space-y-3">
        <div className="grid items-end gap-2 sm:max-w-lg sm:grid-cols-[minmax(0,1fr)_auto]">
          <Input
            label="주문 ID"
            name="order_id"
            value={orderId}
            onChange={(event) => setOrderId(event.currentTarget.value)}
            placeholder="order_…"
            required
            className="max-md:text-base"
          />
          <SubmitButton variant="outline" className="h-[46px] px-4">
            주문 연결 요청
          </SubmitButton>
        </div>
        {state.error && (
          <Alert variant="destructive">
            <AlertDescription>
              주문을 연결하지 못했어요. 주문 ID를 확인하고 다시 시도해 주세요.
            </AlertDescription>
          </Alert>
        )}
        {state.success && (
          <Alert role="status" className="border-emerald-200 bg-emerald-50">
            <AlertDescription className="text-emerald-900">
              주문 연결 요청을 접수했습니다.
            </AlertDescription>
          </Alert>
        )}
      </form>
    </section>
  )
}

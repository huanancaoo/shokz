"use client"

import { useEffect } from "react"
import { useFormStatus } from "react-dom"
import useToggleState from "@lib/hooks/use-toggle-state"
import { Button } from "@modules/common/components/ui/button"
import { Spinner } from "@modules/common/components/ui/spinner"
import { Alert, AlertDescription } from "@modules/common/components/ui/alert"
import { FieldGroup } from "@modules/common/components/ui/field"

type AccountInfoProps = {
  label: string
  currentInfo: string | React.ReactNode
  isSuccess?: boolean
  isError?: boolean
  errorMessage?: string
  clearState: () => void
  children?: React.ReactNode
  "data-testid"?: string
}

export default function AccountInfo({
  label,
  currentInfo,
  isSuccess,
  isError,
  clearState,
  errorMessage = "저장하지 못했습니다. 다시 시도해 주세요.",
  children,
  "data-testid": testId,
}: AccountInfoProps) {
  const { state, close, toggle } = useToggleState()
  const { pending } = useFormStatus()
  useEffect(() => {
    if (isSuccess) close()
  }, [isSuccess, close])
  return (
    <section className="account-info-section" data-testid={testId}>
      <div className="flex items-center justify-between gap-6">
        <div>
          <p className="text-xs text-muted-foreground mb-2">{label}</p>
          <div className="font-medium" data-testid="current-info">
            {currentInfo}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={() => {
            clearState()
            toggle()
          }}
          data-testid="edit-button"
          data-active={state}
        >
          {state ? "취소" : "수정"}
        </Button>
      </div>
      {isSuccess && (
        <Alert className="mt-4" data-testid="success-message">
          <AlertDescription>{label} 정보를 저장했습니다.</AlertDescription>
        </Alert>
      )}
      {isError && (
        <Alert
          variant="destructive"
          className="mt-4"
          data-testid="error-message"
        >
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      {state && (
        <FieldGroup className="mt-6">
          {children}
          <Button disabled={pending} type="submit" data-testid="save-button">
            {pending && <Spinner data-icon="inline-start" />}변경사항 저장
          </Button>
        </FieldGroup>
      )}
    </section>
  )
}

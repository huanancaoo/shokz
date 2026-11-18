"use client"

import { Edit02Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useEffect, useId, useRef, useState, useTransition } from "react"
import type { FormEvent, ReactNode } from "react"
import { Alert, AlertDescription } from "@modules/common/components/ui/alert"
import { Button } from "@modules/common/components/ui/button"
import { Spinner } from "@modules/common/components/ui/spinner"

type AccountInfoProps = {
  label: string
  currentInfo: ReactNode
  onSave?: (data: FormData) => Promise<boolean>
  children?: ReactNode
  "data-testid"?: string
}

export default function AccountInfo({
  label,
  currentInfo,
  onSave,
  children,
  "data-testid": testId,
}: AccountInfoProps) {
  const [editing, setEditing] = useState(false)
  const [feedback, setFeedback] = useState<"saved" | "error" | null>(null)
  const [pending, startTransition] = useTransition()
  const formId = useId()
  const editButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (feedback === "saved" && !pending) editButton.current?.focus()
  }, [feedback, pending])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!onSave) return

    const data = new FormData(event.currentTarget)

    startTransition(async () => {
      try {
        const saved = await onSave(data)
        setFeedback(saved ? "saved" : "error")
        if (saved) setEditing(false)
      } catch {
        setFeedback("error")
      }
    })
  }

  return (
    <div className="py-4 sm:py-5" data-testid={testId}>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <p className="text-[13px] leading-5 text-muted-foreground">{label}</p>
          <div
            className="text-sm font-medium leading-6 [overflow-wrap:anywhere] sm:text-base sm:leading-6"
            data-testid="current-info"
          >
            {currentInfo}
          </div>
        </div>
        {onSave && (
          <Button
            ref={editButton}
            variant="outline"
            type="button"
            className="h-10 gap-1.5 px-3"
            aria-label={editing ? `${label} 수정 취소` : `${label} 수정`}
            aria-expanded={editing}
            aria-controls={editing ? formId : undefined}
            disabled={pending}
            onClick={() => {
              setFeedback(null)
              setEditing(!editing)
            }}
            data-testid="edit-button"
            data-active={editing}
          >
            {!editing && <HugeiconsIcon icon={Edit02Icon} aria-hidden />}
            {editing ? "취소" : "수정"}
          </Button>
        )}
      </div>
      {editing && (
        <form
          id={formId}
          onSubmit={submit}
          aria-busy={pending}
          className="mt-4 space-y-4 rounded-xl border bg-muted/40 p-4 max-md:[&_input]:text-base max-md:[&_select]:text-base"
        >
          <fieldset className="min-w-0" disabled={pending}>
            {children}
          </fieldset>
          {feedback === "error" && (
            <Alert variant="destructive" data-testid="error-message">
              <AlertDescription>
                저장하지 못했습니다. 다시 시도해 주세요.
              </AlertDescription>
            </Alert>
          )}
          <Button
            className="h-11 px-4"
            disabled={pending}
            type="submit"
            data-testid="save-button"
          >
            {pending && <Spinner data-icon="inline-start" />}
            {pending ? "저장 중" : "변경사항 저장"}
          </Button>
        </form>
      )}
      <p
        role="status"
        className={
          feedback === "saved" ? "mt-2 text-sm text-emerald-800" : "sr-only"
        }
        data-testid={feedback === "saved" ? "success-message" : undefined}
      >
        {feedback === "saved" ? "변경사항을 저장했습니다." : ""}
      </p>
    </div>
  )
}

"use client"
import { Spinner } from "@modules/common/components/ui/spinner"

import { Button } from "@modules/common/components/ui/button"
import React from "react"
import { useFormStatus } from "react-dom"

export function SubmitButton({
  children,
  variant = "default",
  size = "default",
  className,
  "data-testid": dataTestId,
}: {
  children: React.ReactNode
  variant?: "default" | "outline" | "ghost" | null
  size?: "sm" | "default" | "lg"
  className?: string
  "data-testid"?: string
}) {
  const { pending } = useFormStatus()

  return (
    <Button
      size={size}
      className={className}
      type="submit"
      disabled={pending}
      variant={variant || "default"}
      data-testid={dataTestId}
    >
      {pending && <Spinner data-icon="inline-start" />}
      {children}
    </Button>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "next/navigation"
import { buttonVariants } from "@modules/common/components/ui/button"
import { confirmEmailVerification } from "@lib/data/customer"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type VerificationState = "verifying" | "success" | "error"

const VerifyAccount = () => {
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [state, setState] = useState<VerificationState>("verifying")
  // Guard against the effect running twice in React Strict Mode, which would
  // consume the single-use token before the customer sees the result.
  const confirmed = useRef(false)

  useEffect(() => {
    if (confirmed.current) {
      return
    }
    confirmed.current = true

    if (!token) {
      setState("error")
      return
    }

    confirmEmailVerification(token).then(({ success }) =>
      setState(success ? "success" : "error")
    )
  }, [token])

  return (
    <div
      className="max-w-sm w-full flex flex-col items-center text-center gap-y-4"
      data-testid="verify-account-page"
    >
      <h1 className="text-large-semi uppercase">이메일 확인</h1>

      {state === "verifying" && (
        <p className="text-base-regular text-foreground">이메일 확인 중...</p>
      )}

      {state === "success" && (
        <>
          <p className="text-base-regular text-foreground">
            이메일이 확인되었습니다. 계정에 로그인할 수 있습니다.
          </p>
          <LocalizedClientLink
            href="/account"
            className={buttonVariants({ variant: "default" })}
          >
            로그인하기
          </LocalizedClientLink>
        </>
      )}

      {state === "error" && (
        <>
          <p className="text-base-regular text-foreground">
            This verification link is invalid or has expired. Sign in to receive
            a new verification email.
          </p>
          <LocalizedClientLink
            href="/account"
            className={buttonVariants({ variant: "outline" })}
          >
            로그인하기
          </LocalizedClientLink>
        </>
      )}
    </div>
  )
}

export default VerifyAccount

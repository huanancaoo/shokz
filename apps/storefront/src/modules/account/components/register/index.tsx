"use client"

import { useActionState } from "react"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction] = useActionState(signup, null)

  return (
    <div
      className="max-w-sm flex flex-col items-center"
      data-testid="register-page"
    >
      <h1 className="text-large-semi uppercase mb-6">샥즈 계정 만들기</h1>
      <p className="text-center text-base-regular text-foreground mb-4">
        샥즈 계정으로 주문 내역과 배송지를 편리하게 관리하세요.
      </p>
      {message?.state === "verification_required" && (
        <div
          className="w-full mb-4 text-center text-base-regular text-foreground bg-muted border border-border rounded-rounded p-4"
          data-testid="register-verification-message"
        >
          이메일 확인 링크 수신 주소: <strong>{message.email}</strong>. 받은
          편지함에서 이메일을 확인한 후 로그인해 주세요.
        </div>
      )}
      <form className="w-full flex flex-col" action={formAction}>
        <div className="flex flex-col w-full gap-y-2">
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
          <Input
            label="이메일"
            name="email"
            required
            type="email"
            autoComplete="email"
            data-testid="email-input"
          />
          <Input
            label="전화번호"
            name="phone"
            type="tel"
            autoComplete="tel"
            data-testid="phone-input"
          />
          <Input
            label="비밀번호"
            name="password"
            required
            type="password"
            autoComplete="new-password"
            data-testid="password-input"
          />
        </div>
        <ErrorMessage
          error={message?.state === "error" ? message.error : null}
          data-testid="register-error"
        />
        <span className="text-center text-foreground text-small-regular mt-6">
          회원가입 시 다음 정책에 동의합니다:{" "}
          <LocalizedClientLink href="/pages/privacy" className="underline">
            개인정보처리방침
          </LocalizedClientLink>{" "}
          및{" "}
          <LocalizedClientLink href="/pages/terms" className="underline">
            이용약관
          </LocalizedClientLink>
          .
        </span>
        <SubmitButton className="w-full mt-6" data-testid="register-button">
          가입하기
        </SubmitButton>
      </form>
      <span className="text-center text-foreground text-small-regular mt-6">
        이미 계정이 있으신가요?{" "}
        <button
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="underline"
        >
          로그인
        </button>
        .
      </span>
    </div>
  )
}

export default Register

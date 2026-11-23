"use client"

import { useActionState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import Input from "@modules/common/components/input"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { signup } from "@lib/data/customer"
import { Button } from "@modules/common/components/ui/button"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Register = ({ setCurrentView }: Props) => {
  const [message, formAction, pending] = useActionState(signup, null)

  return (
    <div className="w-full" data-testid="register-page">
      <div className="mb-[30px] max-[480px]:mb-[26px]">
        <p className="mb-3 text-[10px] font-semibold tracking-[.17em] text-accent-foreground">
          JOIN SHOKZ
        </p>
        <h1
          className="mb-3 text-[clamp(26px,2.3vw,32px)] font-semibold leading-[1.4] tracking-[-1.25px] text-foreground focus:outline-none max-[480px]:text-[27px]"
          tabIndex={-1}
        >
          샥즈 계정 만들기
        </h1>
        <p className="max-w-[365px] text-[13px] leading-[1.85] text-muted-foreground">
          샥즈 계정으로 주문 내역과 배송지를 편리하게 관리하세요.
        </p>
      </div>
      {message?.state === "verification_required" && (
        <div
          className="mb-[22px] break-words border-l-[3px] border-primary bg-accent px-4 py-3.5 text-xs leading-[1.85] text-accent-foreground"
          role="status"
          data-testid="register-verification-message"
        >
          이메일 확인 링크 수신 주소: <strong>{message.email}</strong>. 받은
          편지함에서 이메일을 확인한 후 로그인해 주세요.
        </div>
      )}
      <form className="w-full" action={formAction} aria-busy={pending}>
        <div className="flex flex-col gap-[18px] [&_[data-slot=field]]:min-w-0 [&_[data-slot=field]]:gap-2 [&_[data-slot=field-label]]:text-xs [&_[data-slot=field-label]]:font-medium [&_[data-slot=field-label]]:text-[#322f2a]">
          <div className="grid grid-cols-2 gap-3.5">
            <Input
              label="이름"
              name="first_name"
              required
              autoComplete="given-name"
              className="h-12 border-input text-sm focus-visible:border-primary focus-visible:ring-ring/10 max-md:text-base"
              data-testid="first-name-input"
            />
            <Input
              label="성"
              name="last_name"
              required
              autoComplete="family-name"
              className="h-12 border-input text-sm focus-visible:border-primary focus-visible:ring-ring/10 max-md:text-base"
              data-testid="last-name-input"
            />
          </div>
          <Input
            label="이메일"
            name="email"
            required
            type="email"
            autoComplete="email"
            placeholder="name@example.com"
            className="h-12 border-input text-sm placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-ring/10 max-md:text-base"
            data-testid="email-input"
          />
          <Input
            label="전화번호"
            name="phone"
            type="tel"
            autoComplete="tel"
            className="h-12 border-input text-sm focus-visible:border-primary focus-visible:ring-ring/10 max-md:text-base"
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
        {message?.state === "error" && (
          <div
            className="mt-4 border-l-[3px] border-[#bd2525] bg-[#fff0ed] px-3.5 py-3 [&>div]:p-0 [&>div]:text-xs [&>div]:leading-[1.75] [&>div]:text-[#a51d1d]"
            role="alert"
          >
            <ErrorMessage error={message.error} data-testid="register-error" />
          </div>
        )}
        <p className="mt-5 text-[11px] leading-[1.9] text-muted-foreground [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-[3px]">
          회원가입 시 다음 정책에 동의합니다:{" "}
          <LocalizedClientLink href="/pages/privacy">
            개인정보처리방침
          </LocalizedClientLink>{" "}
          및{" "}
          <LocalizedClientLink href="/pages/terms">
            이용약관
          </LocalizedClientLink>
          .
        </p>
        <SubmitButton
          className="mt-[26px] h-[50px] min-h-[50px] w-full justify-between gap-3.5 rounded-[calc(9px*var(--storefront-radius-scale))] border border-primary bg-primary px-[18px] text-sm font-semibold text-primary-foreground shadow-none transition-[background,transform] hover:-translate-y-px hover:border-[#ed5700] hover:bg-[#ed5700] active:translate-y-0 disabled:translate-y-0 disabled:border-[#e8e4dc] disabled:bg-[#e8e4dc] disabled:text-[#77726a] disabled:opacity-100 motion-reduce:transform-none motion-reduce:transition-none"
          data-testid="register-button"
        >
          가입하기
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={19}
            data-icon="inline-end"
            aria-hidden="true"
          />
        </SubmitButton>
      </form>
      <div className="mt-[26px] flex flex-wrap items-center justify-between gap-3 border-t border-border pt-[22px] text-xs">
        <span className="text-muted-foreground">이미 계정이 있으신가요?</span>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setCurrentView(LOGIN_VIEW.SIGN_IN)}
          className="h-auto min-h-[38px] gap-[9px] rounded-none p-0 text-xs font-semibold text-accent-foreground hover:bg-transparent hover:text-foreground"
        >
          로그인
          <HugeiconsIcon icon={ArrowRight01Icon} size={17} aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}

export default Register

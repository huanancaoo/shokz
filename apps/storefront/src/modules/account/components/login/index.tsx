import { useActionState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { login } from "@lib/data/customer"
import { LOGIN_VIEW } from "@modules/account/templates/login-template"
import ErrorMessage from "@modules/checkout/components/error-message"
import { SubmitButton } from "@modules/checkout/components/submit-button"
import Input from "@modules/common/components/input"
import { Button } from "@modules/common/components/ui/button"

type Props = {
  setCurrentView: (view: LOGIN_VIEW) => void
}

const Login = ({ setCurrentView }: Props) => {
  const [message, formAction, pending] = useActionState(login, null)

  return (
    <div className="w-full" data-testid="login-page">
      <div className="mb-[30px] max-[480px]:mb-[26px]">
        <p className="mb-3 text-[10px] font-semibold tracking-[.17em] text-accent-foreground">
          MY SHOKZ
        </p>
        <h1
          className="mb-3 text-[clamp(26px,2.3vw,32px)] font-semibold leading-[1.4] tracking-[-1.25px] text-foreground focus:outline-none max-[480px]:text-[27px]"
          tabIndex={-1}
        >
          다시 만나 반갑습니다
        </h1>
        <p className="max-w-[365px] text-[13px] leading-[1.85] text-muted-foreground">
          이메일로 로그인해 주세요.
        </p>
      </div>
      {message?.state === "verification_required" && (
        <div
          className="mb-[22px] break-words border-l-[3px] border-primary bg-accent px-4 py-3.5 text-xs leading-[1.85] text-accent-foreground"
          role="status"
          data-testid="login-verification-message"
        >
          이메일 확인 링크 수신 주소: <strong>{message.email}</strong>. 이메일을
          확인한 후 로그인해 주세요.
        </div>
      )}
      <form className="w-full" action={formAction} aria-busy={pending}>
        <div className="flex flex-col gap-[18px] [&_[data-slot=field]]:min-w-0 [&_[data-slot=field]]:gap-2 [&_[data-slot=field-label]]:text-xs [&_[data-slot=field-label]]:font-medium [&_[data-slot=field-label]]:text-[#322f2a]">
          <Input
            label="이메일"
            name="email"
            type="email"
            title="올바른 이메일 주소를 입력해 주세요."
            autoComplete="email"
            placeholder="name@example.com"
            className="h-12 border-input text-sm placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-ring/10 max-md:text-base"
            required
            data-testid="email-input"
          />
          <Input
            label="비밀번호"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            data-testid="password-input"
          />
        </div>
        {message?.state === "error" && (
          <div
            className="mt-4 border-l-[3px] border-[#bd2525] bg-[#fff0ed] px-3.5 py-3 [&>div]:p-0 [&>div]:text-xs [&>div]:leading-[1.75] [&>div]:text-[#a51d1d]"
            role="alert"
          >
            <ErrorMessage
              error={message.error}
              data-testid="login-error-message"
            />
          </div>
        )}
        <SubmitButton
          data-testid="sign-in-button"
          className="mt-[26px] h-[50px] min-h-[50px] w-full justify-between gap-3.5 rounded-[calc(9px*var(--storefront-radius-scale))] border border-primary bg-primary px-[18px] text-sm font-semibold text-primary-foreground shadow-none transition-[background,transform] hover:-translate-y-px hover:border-[#ed5700] hover:bg-[#ed5700] active:translate-y-0 disabled:translate-y-0 disabled:border-[#e8e4dc] disabled:bg-[#e8e4dc] disabled:text-[#77726a] disabled:opacity-100 motion-reduce:transform-none motion-reduce:transition-none"
        >
          로그인
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={19}
            data-icon="inline-end"
            aria-hidden="true"
          />
        </SubmitButton>
      </form>
      <div className="mt-[26px] flex flex-wrap items-center justify-between gap-3 border-t border-border pt-[22px] text-xs">
        <span className="text-muted-foreground">아직 계정이 없으신가요?</span>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setCurrentView(LOGIN_VIEW.REGISTER)}
          className="h-auto min-h-[38px] gap-[9px] rounded-none p-0 text-xs font-semibold text-accent-foreground hover:bg-transparent hover:text-foreground"
          data-testid="register-button"
        >
          회원가입
          <HugeiconsIcon icon={ArrowRight01Icon} size={17} aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}

export default Login

import { buttonVariants } from "@modules/common/components/ui/button"
import { Heading, Text } from "@/components/typography"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const SignInPrompt = () => {
  return (
    <div className="bg-white flex items-center justify-between">
      <div>
        <Heading level="h2" className="text-xl">
          이미 계정이 있으신가요?
        </Heading>
        <Text className="text-sm text-muted-foreground mt-2">
          로그인하고 편리하게 쇼핑하세요.
        </Text>
      </div>
      <div>
        <LocalizedClientLink
          href="/account"
          className={buttonVariants({ variant: "outline" })}
          data-testid="sign-in-button"
        >
          로그인
        </LocalizedClientLink>
      </div>
    </div>
  )
}

export default SignInPrompt

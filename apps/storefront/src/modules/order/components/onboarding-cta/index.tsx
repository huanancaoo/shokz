"use client"

import { resetOnboardingState } from "@lib/data/onboarding"
import { Button } from "@modules/common/components/ui/button"
import { Text } from "@/components/typography"

const OnboardingCta = ({ orderId }: { orderId: string }) => {
  return (
    <div className="max-w-4xl h-full bg-muted w-full">
      <div className="flex flex-col gap-y-4 center p-4 md:items-center">
        <Text className="text-foreground text-xl">
          테스트 주문이 접수되었습니다.
        </Text>
        <Text className="text-muted-foreground text-small-regular">
          You can now complete setting up your store in the admin.
        </Text>
        <Button
          className="w-fit"
          size="lg"
          onClick={() => resetOnboardingState(orderId)}
        >
          Complete setup in admin
        </Button>
      </div>
    </div>
  )
}

export default OnboardingCta

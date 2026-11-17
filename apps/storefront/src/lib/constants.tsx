import { HugeiconsIcon } from "@hugeicons/react"
import { CreditCardIcon } from "@hugeicons/core-free-icons"

export const getPaymentInfo = (providerId?: string) =>
  providerId === "pp_system_default"
    ? {
        title: "Medusa 테스트 결제",
        icon: <HugeiconsIcon icon={CreditCardIcon} />,
      }
    : undefined

import Image from "next/image"
import branding from "@/content/branding.json"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="w-full bg-white relative small:min-h-screen">
      <div className="h-16 bg-white border-b ">
        <nav className="flex h-full items-center content-container justify-between">
          <LocalizedClientLink
            href="/cart"
            className="text-small-semi text-foreground flex items-center gap-x-2 uppercase flex-1 basis-0"
            data-testid="back-to-cart-link"
          >
            <HugeiconsIcon
              icon={ArrowDown01Icon}
              className="rotate-90"
              size={16}
            />
            <span className="mt-px hidden small:block text-sm font-medium text-muted-foreground hover:text-foreground ">
              장바구니로 돌아가기
            </span>
            <span className="mt-px block small:hidden text-sm font-medium text-muted-foreground hover:text-foreground">
              Back
            </span>
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/"
            className="text-xl font-semibold text-muted-foreground hover:text-foreground uppercase"
            data-testid="store-link"
          >
            <Image
              src={branding.logo}
              alt="SHOKZ"
              width={187}
              height={55}
              className="brand-logo-image checkout-logo"
            />
          </LocalizedClientLink>
          <div className="flex-1 basis-0" />
        </nav>
      </div>
      <div className="relative" data-testid="checkout-container">
        {children}
      </div>
      <div className="py-4 w-full flex items-center justify-center"></div>
    </div>
  )
}

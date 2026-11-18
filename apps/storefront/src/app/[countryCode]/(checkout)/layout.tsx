import Image from "@modules/common/components/store-image"
import branding from "@/content/branding.json"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-svh bg-muted">
      <header className="border-b bg-background">
        <nav
          aria-label="주문 메뉴"
          className="mx-auto grid h-16 max-w-[44rem] grid-cols-[1fr_auto_1fr] items-center px-4 md:px-8 small:max-w-[76rem]"
        >
          <LocalizedClientLink
            href="/cart"
            className="inline-flex min-h-11 w-fit items-center gap-1.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
            data-testid="back-to-cart-link"
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              size={17}
              aria-hidden="true"
            />
            <span>
              장바구니<span className="hidden sm:inline">로 돌아가기</span>
            </span>
          </LocalizedClientLink>
          <LocalizedClientLink
            href="/"
            className="grid min-h-11 place-items-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
            data-testid="store-link"
          >
            <Image
              src={branding.logo}
              alt="SHOKZ"
              width={187}
              height={55}
              className="h-auto w-[88px] invert sm:w-[102px]"
            />
          </LocalizedClientLink>
        </nav>
      </header>
      <div data-testid="checkout-container">{children}</div>
    </div>
  )
}

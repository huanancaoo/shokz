import Image from "next/image"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { HttpTypes } from "@medusajs/types"
import type { getStorefrontFooter } from "@lib/data/cms"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Button, buttonVariants } from "@modules/common/components/ui/button"
import { Input } from "@modules/common/components/ui/input"
import StorefrontContentLink from "@modules/layout/components/storefront-content-link"

const footerLinkClassName =
  "inline-flex min-h-9 w-fit items-center break-keep py-1.5 text-[11px] leading-[1.75] text-background/80 transition-[color,transform] hover:translate-x-0.5 hover:text-primary focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff914e] motion-reduce:transform-none motion-reduce:transition-none"

const policyLinkClassName =
  "inline-flex min-h-8 items-center text-[10px] text-background/70 transition-colors hover:text-background focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff914e]"

export default function Footer({
  settings,
  categories,
  logoURL,
}: {
  settings: Awaited<ReturnType<typeof getStorefrontFooter>>
  categories: HttpTypes.StoreProductCategory[]
  logoURL: string
}) {
  const { catalog, columns, policies } = settings

  return (
    <footer className="shokz-footer border-t-[3px] border-primary bg-foreground text-background">
      <div className="mx-auto w-full max-w-[1560px] px-5 sm:px-8 lg:px-[5vw]">
        <div className="grid gap-9 border-b border-background/20 py-11 md:grid-cols-2 md:items-center md:gap-12 lg:py-14">
          <div>
            <p className="mb-4 text-[10px] font-semibold tracking-[.18em] text-primary">
              STAY OPEN. STAY CONNECTED.
            </p>
            <h2 className="text-[32px] font-semibold leading-[1.28] tracking-[-1.2px] lg:text-[44px] lg:tracking-[-1.8px]">
              함께 듣는 세상,
              <br />
              <span className="text-primary">함께하는 샥즈.</span>
            </h2>
            <LocalizedClientLink
              href="/pages/membership"
              className={buttonVariants({
                size: "lg",
                className:
                  "group mt-6 min-h-12 gap-7 rounded-lg border border-primary bg-primary px-5 text-xs font-semibold text-primary-foreground hover:border-primary hover:bg-primary/80 focus-visible:ring-[#ff914e] motion-reduce:transition-none",
              })}
            >
              샥즈 멤버십 알아보기
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                size={18}
                className="transition-transform group-hover:translate-x-1 motion-reduce:transform-none"
                aria-hidden="true"
              />
            </LocalizedClientLink>
          </div>
          <div className="w-full rounded-xl border border-border bg-muted p-6 text-foreground md:max-w-[480px] md:justify-self-end lg:p-7">
            <h3 className="text-lg font-semibold leading-[1.5] tracking-[-.4px]">
              샥즈의 새로운 소식을 만나보세요
            </h3>
            <p className="mt-2 text-xs leading-[1.85] text-muted-foreground">
              신제품과 브랜드 이야기, 특별한 순간을 가장 먼저.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <Input
                type="email"
                placeholder="이메일 주소"
                aria-label="뉴스레터 이메일 주소"
                disabled
                className="h-12 min-w-0 flex-1 rounded-lg border-input bg-card text-sm placeholder:text-muted-foreground disabled:bg-card disabled:opacity-100"
              />
              <Button
                variant="secondary"
                size="icon"
                disabled
                className="size-12 shrink-0 rounded-lg border border-input bg-secondary text-muted-foreground disabled:bg-secondary disabled:opacity-100"
                aria-label="뉴스레터 구독 전시 화면"
              >
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={20}
                  aria-hidden="true"
                />
              </Button>
            </div>
            <small className="mt-3 block text-[10px] leading-[1.8] text-muted-foreground">
              POC 전시 화면 · 구독 정보는 수집하지 않습니다.
            </small>
          </div>
        </div>
        <nav
          aria-label="하단 메뉴"
          className="grid grid-cols-3 gap-x-4 gap-y-8 py-10 lg:grid-cols-[1.3fr_1fr_1fr_1fr] lg:gap-x-10 lg:py-11"
        >
          <div className="col-span-3 flex flex-wrap items-start justify-between gap-5 lg:col-span-1 lg:block">
            <div>
              <div className="relative aspect-[57/23] w-[72px]">
                <Image
                  src={logoURL}
                  alt="SHOKZ"
                  fill
                  unoptimized
                  className="object-contain brightness-0 invert dark:invert-0"
                />
              </div>
              <p className="mt-4 text-xs leading-[1.8] text-background/80">
                {settings.tagline}
              </p>
            </div>
            <span className="block text-[10px] leading-5 text-background/70 lg:mt-6">
              {settings.marketLabel}
            </span>
          </div>
          <div>
            <h3 className="mb-3 text-xs font-semibold text-background">{catalog.label}</h3>
            <ul className="space-y-0.5">
              <li>
                <LocalizedClientLink
                  href="/store"
                  className={footerLinkClassName}
                >
                  {catalog.storeLabel}
                </LocalizedClientLink>
              </li>
              {categories.map((category) => (
                <li key={category.id}>
                  <LocalizedClientLink
                    href={"/categories/" + category.handle}
                    className={footerLinkClassName}
                  >
                    {category.name}
                  </LocalizedClientLink>
                </li>
              ))}
              <li>
                <LocalizedClientLink
                  href="/compare"
                  className={footerLinkClassName}
                >
                  {catalog.compareLabel}
                </LocalizedClientLink>
              </li>
            </ul>
          </div>
          {columns.map(({ id, label, links }) => (
            <div key={id ?? label}>
              <h3 className="mb-3 text-xs font-semibold text-background">
                {label}
              </h3>
              <ul className="space-y-0.5">
                {links.map(({ id, label, href, newTab }) => (
                  <li key={id ?? href}>
                    <StorefrontContentLink
                      href={href}
                      newTab={newTab}
                      className={footerLinkClassName}
                    >
                      {label}
                    </StorefrontContentLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
        <div className="flex flex-col gap-3 border-t border-background/20 py-5 text-[10px] text-background/70 md:flex-row md:items-center md:justify-between md:gap-6">
          <span>© {new Date().getFullYear()} {settings.copyright}</span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            {policies.map(({ id, label, href, newTab }) => (
              <StorefrontContentLink
                key={id ?? href}
                href={href}
                newTab={newTab}
                className={policyLinkClassName}
              >
                {label}
              </StorefrontContentLink>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

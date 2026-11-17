import Image from "next/image"
import branding from "@/content/branding.json"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { listCategories } from "@lib/data/categories"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Button, buttonVariants } from "@modules/common/components/ui/button"
import { Input } from "@modules/common/components/ui/input"

const footerLinkClassName =
  "inline-flex min-h-9 w-fit items-center break-keep py-1.5 text-[11px] leading-[1.75] text-[#c7c2b8] transition-[color,transform] hover:translate-x-0.5 hover:text-[#ff914e] focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff914e] motion-reduce:transform-none motion-reduce:transition-none"

const policyLinkClassName =
  "inline-flex min-h-8 items-center text-[10px] text-[#b2aca1] transition-colors hover:text-white focus-visible:rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff914e]"

export default async function Footer() {
  const categories = await listCategories()

  return (
    <footer className="shokz-footer border-t-[3px] border-[#ff6008] bg-[#171717] text-[#f7f5ef]">
      <div className="mx-auto w-full max-w-[1560px] px-5 sm:px-8 lg:px-[5vw]">
        <div className="grid gap-9 border-b border-[#3a3934] py-11 md:grid-cols-2 md:items-center md:gap-12 lg:py-14">
          <div>
            <p className="mb-4 text-[10px] font-semibold tracking-[.18em] text-[#ff914e]">
              STAY OPEN. STAY CONNECTED.
            </p>
            <h2 className="text-[32px] font-semibold leading-[1.28] tracking-[-1.2px] lg:text-[44px] lg:tracking-[-1.8px]">
              함께 듣는 세상,
              <br />
              <span className="text-[#ff914e]">함께하는 샥즈.</span>
            </h2>
            <LocalizedClientLink
              href="/pages/membership"
              className={buttonVariants({
                size: "lg",
                className:
                  "group mt-6 min-h-12 gap-7 rounded-lg border border-[#ff6008] bg-[#ff6008] px-5 text-xs font-semibold text-[#171717] hover:border-[#ff914e] hover:bg-[#ff914e] focus-visible:ring-[#ff914e] motion-reduce:transition-none",
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
          <div className="w-full rounded-xl border border-[#e3ded4] bg-[#f3f1ea] p-6 text-[#211f1b] md:max-w-[480px] md:justify-self-end lg:p-7">
            <h3 className="text-lg font-semibold leading-[1.5] tracking-[-.4px]">
              샥즈의 새로운 소식을 만나보세요
            </h3>
            <p className="mt-2 text-xs leading-[1.85] text-[#6c655b]">
              신제품과 브랜드 이야기, 특별한 순간을 가장 먼저.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <Input
                type="email"
                placeholder="이메일 주소"
                aria-label="뉴스레터 이메일 주소"
                disabled
                className="h-12 min-w-0 flex-1 rounded-lg border-[#d0c9bc] bg-white text-sm placeholder:text-[#8b8377] disabled:bg-white disabled:opacity-100"
              />
              <Button
                variant="secondary"
                size="icon"
                disabled
                className="size-12 shrink-0 rounded-lg border border-[#d0c9bc] bg-[#e2ded4] text-[#70685a] disabled:bg-[#e2ded4] disabled:opacity-100"
                aria-label="뉴스레터 구독 전시 화면"
              >
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={20}
                  aria-hidden="true"
                />
              </Button>
            </div>
            <small className="mt-3 block text-[10px] leading-[1.8] text-[#766f63]">
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
              <Image
                src={branding.logo}
                alt="SHOKZ"
                width={187}
                height={55}
                className="h-auto w-[118px] brightness-0 invert"
              />
              <p className="mt-4 text-xs leading-[1.8] text-[#c7c2b8]">
                귀를 열고, 가능성을 열다.
              </p>
            </div>
            <span className="block text-[10px] leading-5 text-[#a49d91] lg:mt-6">
              대한민국 · 한국어 · KRW
            </span>
          </div>
          <div>
            <h3 className="mb-3 text-xs font-semibold text-[#f7f5ef]">제품</h3>
            <ul className="space-y-0.5">
              <li>
                <LocalizedClientLink
                  href="/store"
                  className={footerLinkClassName}
                >
                  전체 제품
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
                  제품 비교
                </LocalizedClientLink>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-xs font-semibold text-[#f7f5ef]">
              샥즈 알아보기
            </h3>
            <ul className="space-y-0.5">
              {[
                ["오픈이어 기술", "/pages/technology"],
                ["앰버서더", "/pages/ambassador"],
                ["애슬리트", "/pages/athletes"],
                ["샥즈 소식 & 이벤트", "/journal"],
                ["멤버십", "/pages/membership"],
              ].map(([label, href]) => (
                <li key={href}>
                  <LocalizedClientLink
                    href={href}
                    className={footerLinkClassName}
                  >
                    {label}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mb-3 text-xs font-semibold text-[#f7f5ef]">
              고객지원
            </h3>
            <ul className="space-y-0.5">
              {[
                ["고객지원", "support"],
                ["자주 묻는 질문", "faq"],
                ["정품 등록", "registration"],
                ["매장 찾기", "stores"],
                ["비즈니스 문의", "business"],
                ["보증 정책", "warranty"],
              ].map(([name, slug]) => (
                <li key={slug}>
                  <LocalizedClientLink
                    href={"/pages/" + slug}
                    className={footerLinkClassName}
                  >
                    {name}
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>
        <div className="flex flex-col gap-3 border-t border-[#3a3934] py-5 text-[10px] text-[#a49d91] md:flex-row md:items-center md:justify-between md:gap-6">
          <span>© {new Date().getFullYear()} SHOKZ. POC EXPERIENCE.</span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
            {[
              ["개인정보처리방침", "/pages/privacy"],
              ["이용약관", "/pages/terms"],
              ["배송 안내", "/shipping"],
              ["교환 및 반품", "/returns"],
            ].map(([label, href]) => (
              <LocalizedClientLink
                key={href}
                href={href}
                className={policyLinkClassName}
              >
                {label}
              </LocalizedClientLink>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

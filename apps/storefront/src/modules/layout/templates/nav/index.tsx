"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import branding from "@/content/branding.json"
import { useParams, usePathname } from "next/navigation"
import { useCompare } from "@lib/context/compare-context"
import { cn } from "@lib/utils"
import type { HttpTypes } from "@medusajs/types"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  GitCompareIcon,
  Menu01Icon,
  Search01Icon,
  UserIcon,
  ArrowRight01Icon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons"
import { Button, buttonVariants } from "@modules/common/components/ui/button"
import { Input } from "@modules/common/components/ui/input"
import { Field, FieldLabel } from "@modules/common/components/ui/field"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@modules/common/components/ui/sheet"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@modules/common/components/ui/popover"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@modules/common/components/ui/accordion"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const links = [
  {
    title: "기술",
    href: "/pages/technology",
    children: [
      ["골전도 기술", "bone-conduction-technology"],
      ["Shokz OpenSound", "shokz-opensound"],
      ["오픈이어 오디오", "open-ear-audio-technology"],
      ["컴포트 기술", "comfort-tech"],
      ["스포츠 기술", "sports-tech"],
    ],
  },
  {
    title: "샥즈 스쿼드",
    href: "/pages/ambassador",
    children: [
      ["앰버서더", "ambassador"],
      ["애슬리트", "athletes"],
    ],
  },
  {
    title: "브랜드 스토리",
    href: "/pages/open-ear-guide",
    children: [
      ["오픈이어란", "open-ear-guide"],
      ["일상 속 오픈이어", "lifestyle-guide"],
      ["러닝과 함께", "running-guide"],
    ],
  },
  { title: "멤버십", href: "/pages/membership", children: [] },
  {
    title: "고객지원",
    href: "/pages/support",
    children: [
      ["A/S 안내", "support"],
      ["자주 묻는 질문", "faq"],
      ["매장 찾기", "stores"],
      ["사용 후기", "reviews"],
      ["정품 등록", "registration"],
      ["비즈니스", "business"],
    ],
  },
]

const navItemMotion =
  "relative h-12 gap-1.5 px-2.5 text-sm font-medium transition-colors duration-150 ease-out after:absolute after:inset-x-2.5 after:bottom-1.5 after:h-0.5 after:origin-left after:scale-x-0 after:rounded-full after:bg-[var(--shokz-orange)] after:transition-transform after:duration-200 after:ease-out hover:after:scale-x-100 focus-visible:after:scale-x-100 aria-expanded:after:scale-x-100 min-[1440px]:px-3 motion-reduce:transition-none motion-reduce:after:transition-none"

const headerToolIconClassName = "size-5 min-[1201px]:size-[22px]"

const navLinkMotion =
  "group/nav-link rounded-md outline-none transition-[color,background-color] duration-150 ease-out hover:bg-[#f5f3ef] focus-visible:bg-[#f5f3ef] focus-visible:text-[#c64800] motion-reduce:transition-none"

const sheetMotion =
  "transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] data-[ending-style]:duration-150 data-[ending-style]:ease-in motion-reduce:!transform-none motion-reduce:transition-none [&_[data-slot=sheet-close]]:transition-colors [&_[data-slot=sheet-close]]:duration-150 [&_[data-slot=sheet-close]]:motion-reduce:transition-none"

export default function Nav({
  categories,
  cart,
}: {
  categories: HttpTypes.StoreProductCategory[]
  cart: React.ReactNode
}) {
  const isHome = /^\/[a-z]{2}\/?$/.test(usePathname())
  const { handles } = useCompare()
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 40)
    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [])
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [panel, setPanel] = useState<"menu" | "search" | null>(null)
  const { countryCode = "kr" } = useParams()
  const navigation = [
    {
      title: "제품",
      href: "/store",
      children: [
        ...categories.map((category) => [
          category.name,
          `/categories/${category.handle}`,
        ]),
        [
          "제품 비교하기",
          "/compare" + (handles.length ? "?products=" + handles.join(",") : ""),
        ],
      ],
    },
    ...links.map((link) => ({
      ...link,
      children: link.children.map(([title, slug]) => [title, `/pages/${slug}`]),
    })),
  ]
  return (
    <div
      className={[
        "shokz-header",
        isHome && "home-nav",
        scrolled && "nav-scrolled",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="announcement">
        <b>OPEN YOUR WORLD</b>
        <span>세상과 연결되는 사운드, 샥즈.</span>
        <LocalizedClientLink
          href="/pages/membership"
          className="group/announcement rounded-sm outline-none transition-colors duration-150 hover:text-[#ff8b52] focus-visible:ring-2 focus-visible:ring-[#ff8b52] motion-reduce:transition-none"
        >
          멤버십 알아보기
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            size={14}
            className="transition-transform duration-150 ease-out group-hover/announcement:translate-x-0.5 group-focus-visible/announcement:translate-x-0.5 motion-reduce:!transform-none motion-reduce:transition-none"
          />
        </LocalizedClientLink>
      </div>
      <header
        className={cn(
          "main-header mx-auto flex min-h-[72px] items-center gap-2 px-3 md:min-h-[80px] md:gap-5 md:px-8 min-[1201px]:grid min-[1201px]:min-h-[84px] min-[1201px]:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] min-[1201px]:gap-6",
          isHome
            ? "w-[calc(100%-20px)] max-w-[1450px] rounded-xl bg-background px-2.5 transition-[margin,box-shadow] duration-200 md:w-[calc(100%-48px)] md:rounded-2xl md:px-8 motion-reduce:transition-none"
            : "w-full max-w-[1560px] md:px-[clamp(24px,5vw,80px)] min-[1600px]:max-w-[1640px]",
          isHome &&
            (scrolled
              ? "mt-2 shadow-[0_4px_25px_#0002] md:mt-3"
              : "mt-2.5 shadow-[0_8px_35px_#0000000d] md:mt-4")
        )}
      >
        <Button
          className="shrink-0 transition-colors duration-150 min-[1201px]:hidden motion-reduce:transition-none"
          variant="ghost"
          size="icon"
          aria-label="메뉴 열기"
          aria-expanded={panel === "menu"}
          aria-haspopup="dialog"
          onClick={() => setPanel("menu")}
        >
          <HugeiconsIcon icon={Menu01Icon} className="size-[22px]" />
        </Button>
        <LocalizedClientLink
          href="/"
          className="relative mr-auto block aspect-[57/23] w-14 shrink-0 overflow-hidden rounded-sm transition-opacity duration-150 hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#c64800] md:w-[68px] min-[1201px]:mr-0 min-[1201px]:w-[76px] motion-reduce:transition-none"
          aria-label="Shokz 홈"
        >
          {/* 原图两侧有透明留白；等比放大后只裁掉留白，使可见标识对齐左侧内容。 */}
          <Image
            src={branding.logo}
            alt="SHOKZ"
            fill
            sizes="(min-width: 1201px) 126px, (min-width: 768px) 113px, 93px"
            preload
            className="scale-[1.65] object-contain invert"
          />
        </LocalizedClientLink>
        <nav
          className="primary-nav hidden items-center justify-self-center gap-1 min-[1201px]:flex min-[1440px]:gap-2"
          aria-label="주 메뉴"
        >
          {navigation.map((link) =>
            link.children.length ? (
              <Popover
                key={link.title}
                open={openMenu === link.title}
                onOpenChange={(open) => {
                  // 切换菜单时，旧菜单的关闭回调不能覆盖新菜单的展开状态。
                  setOpenMenu((current) =>
                    open ? link.title : current === link.title ? null : current
                  )
                }}
              >
                <PopoverTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="sm"
                      className={navItemMotion}
                    />
                  }
                >
                  {link.title}
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    data-icon="inline-end"
                    className="size-3.5 transition-transform duration-200 ease-out group-aria-expanded/button:rotate-180 motion-reduce:transition-none"
                  />
                </PopoverTrigger>
                <PopoverContent
                  align="start"
                  sideOffset={24}
                  className="nav-menu-content transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] data-[open]:animate-none data-[closed]:animate-none data-[starting-style]:-translate-y-1.5 data-[starting-style]:opacity-0 data-[ending-style]:-translate-y-1 data-[ending-style]:opacity-0 data-[ending-style]:duration-150 data-[ending-style]:ease-in motion-reduce:!transform-none motion-reduce:transition-none"
                >
                  <LocalizedClientLink
                    href={link.href}
                    className={cn("nav-panel-title", navLinkMotion)}
                    onClick={() => setOpenMenu(null)}
                  >
                    {link.title} 알아보기
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      size={18}
                      className="transition-transform duration-150 ease-out group-hover/nav-link:translate-x-0.5 group-focus-visible/nav-link:translate-x-0.5 motion-reduce:!transform-none motion-reduce:transition-none"
                    />
                  </LocalizedClientLink>
                  {link.children.map(([title, href]) => (
                    <LocalizedClientLink
                      key={href}
                      href={href}
                      className={navLinkMotion}
                      onClick={() => setOpenMenu(null)}
                    >
                      {title}
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        size={14}
                        className="-translate-x-1 opacity-0 transition-[opacity,transform] duration-150 ease-out group-hover/nav-link:translate-x-0 group-hover/nav-link:opacity-100 group-focus-visible/nav-link:translate-x-0 group-focus-visible/nav-link:opacity-100 motion-reduce:!transform-none motion-reduce:transition-none"
                      />
                    </LocalizedClientLink>
                  ))}
                </PopoverContent>
              </Popover>
            ) : (
              <LocalizedClientLink
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  navItemMotion
                )}
                href={link.href}
                key={link.title}
              >
                {link.title}
              </LocalizedClientLink>
            )
          )}
          <LocalizedClientLink
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              navItemMotion
            )}
            href="/journal"
          >
            샥즈 소식
          </LocalizedClientLink>
        </nav>
        {/* 状态选择器直接限定子项，避免容器悬停时同时点亮全部工具。 */}
        <div className="header-tools flex shrink-0 items-center justify-self-end gap-0 md:gap-1 min-[1440px]:gap-2 [&>*]:size-11 [&>*]:rounded-full [&>*]:transition-colors [&>*]:duration-150 [&>*:hover]:bg-[#f2f0ec] [&>*[aria-expanded=true]]:bg-[#f2f0ec] min-[1440px]:[&>*]:size-12 [&>*]:motion-reduce:transition-none">
          {handles.length > 0 && (
            <LocalizedClientLink
              href={"/compare?products=" + handles.join(",")}
              className={buttonVariants({
                variant: "ghost",
                size: "icon",
                className: "relative",
              })}
              aria-label={"선택한 " + handles.length + "개 제품 비교하기"}
            >
              <HugeiconsIcon
                icon={GitCompareIcon}
                className={headerToolIconClassName}
                strokeWidth={1.7}
              />
              <span
                className="absolute right-0 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-primary px-1 text-[10px] leading-none text-primary-foreground ring-2 ring-background"
                aria-hidden="true"
              >
                {handles.length}
              </span>
            </LocalizedClientLink>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label="제품 검색"
            aria-expanded={panel === "search"}
            aria-haspopup="dialog"
            onClick={() => setPanel("search")}
          >
            <HugeiconsIcon
              icon={Search01Icon}
              className={headerToolIconClassName}
              strokeWidth={1.7}
            />
          </Button>
          <LocalizedClientLink
            className={buttonVariants({
              variant: "ghost",
              size: "icon",
              className: "hidden md:inline-flex",
            })}
            href="/account"
            aria-label="마이페이지"
          >
            <HugeiconsIcon
              icon={UserIcon}
              className={headerToolIconClassName}
              strokeWidth={1.7}
            />
          </LocalizedClientLink>
          {cart}
        </div>
      </header>
      <Sheet
        open={panel === "menu"}
        onOpenChange={(open) => setPanel(open ? "menu" : null)}
      >
        <SheetContent
          side="left"
          className={cn(
            "mobile-nav-sheet data-[side=left]:data-[starting-style]:-translate-x-5 data-[side=left]:data-[ending-style]:-translate-x-5",
            sheetMotion
          )}
        >
          <SheetHeader>
            <SheetTitle className="shokz-logo">
              <Image
                src={branding.logo}
                alt="SHOKZ"
                width={187}
                height={55}
                className="brand-logo-image"
              />
            </SheetTitle>
            <SheetDescription>당신의 세상을 더 넓게.</SheetDescription>
          </SheetHeader>
          <nav aria-label="모바일 메뉴" className="mobile-nav-content">
            <Accordion
              multiple
              className="[&_[data-slot=accordion-content]]:h-[var(--accordion-panel-height)] [&_[data-slot=accordion-content]]:transition-[height,opacity] [&_[data-slot=accordion-content]]:duration-200 [&_[data-slot=accordion-content]]:ease-out [&_[data-slot=accordion-content][data-starting-style]]:h-0 [&_[data-slot=accordion-content][data-starting-style]]:opacity-0 [&_[data-slot=accordion-content][data-ending-style]]:h-0 [&_[data-slot=accordion-content][data-ending-style]]:opacity-0 [&_[data-slot=accordion-content]]:motion-reduce:transition-none"
            >
              {navigation.map((link) => (
                <AccordionItem value={link.title} key={link.title}>
                  {link.children.length ? (
                    <>
                      <AccordionTrigger className="transition-colors duration-150 hover:text-[#c64800] hover:no-underline motion-reduce:transition-none [&_[data-slot=accordion-trigger-icon]]:!hidden">
                        {link.title}
                        <HugeiconsIcon
                          icon={ArrowDown01Icon}
                          size={18}
                          className="ml-auto shrink-0 transition-transform duration-200 ease-out group-aria-expanded/accordion-trigger:rotate-180 motion-reduce:transition-none"
                        />
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="mobile-nav-links">
                          <LocalizedClientLink
                            onClick={() => setPanel(null)}
                            href={link.href}
                            className={navLinkMotion}
                          >
                            전체 보기
                          </LocalizedClientLink>
                          {link.children.map(([title, href]) => (
                            <LocalizedClientLink
                              onClick={() => setPanel(null)}
                              key={href}
                              href={href}
                              className={navLinkMotion}
                            >
                              {title}
                            </LocalizedClientLink>
                          ))}
                        </div>
                      </AccordionContent>
                    </>
                  ) : (
                    <LocalizedClientLink
                      href={link.href}
                      onClick={() => setPanel(null)}
                      className={cn("mobile-nav-direct", navLinkMotion)}
                    >
                      {link.title}
                    </LocalizedClientLink>
                  )}
                </AccordionItem>
              ))}
            </Accordion>
            <LocalizedClientLink
              href="/journal"
              onClick={() => setPanel(null)}
              className={cn("mobile-nav-direct", navLinkMotion)}
            >
              샥즈 소식 & 이벤트
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/account"
              onClick={() => setPanel(null)}
              className={cn("mobile-nav-direct", navLinkMotion)}
            >
              마이페이지
            </LocalizedClientLink>
            <Button
              variant="outline"
              onClick={() => setPanel("search")}
              className="transition-colors duration-150 motion-reduce:transition-none"
            >
              <HugeiconsIcon icon={Search01Icon} data-icon="inline-start" />
              제품 검색
            </Button>
          </nav>
        </SheetContent>
      </Sheet>
      <Sheet
        open={panel === "search"}
        onOpenChange={(open) => setPanel(open ? "search" : null)}
      >
        <SheetContent
          side="top"
          className={cn(
            "search-sheet data-[side=top]:data-[starting-style]:-translate-y-3 data-[side=top]:data-[ending-style]:-translate-y-3",
            sheetMotion
          )}
        >
          <SheetHeader>
            <SheetTitle>어떤 사운드를 찾고 계신가요?</SheetTitle>
            <SheetDescription>
              제품명 또는 기능으로 샥즈를 찾아보세요.
            </SheetDescription>
          </SheetHeader>
          <form
            action={`/${countryCode}/search`}
            method="get"
            className="search-sheet-form"
            onSubmit={() => setPanel(null)}
          >
            <Field>
              <FieldLabel className="sr-only" htmlFor="header-product-search">
                제품 검색
              </FieldLabel>
              <Input
                id="header-product-search"
                name="q"
                type="search"
                placeholder="오픈런, 오픈핏, 수영..."
                autoFocus
                className="transition-[border-color,box-shadow] duration-150 motion-reduce:transition-none"
              />
            </Field>
            <Button
              size="lg"
              type="submit"
              className="transition-colors duration-150 motion-reduce:transition-none"
            >
              <HugeiconsIcon icon={Search01Icon} data-icon="inline-start" />
              검색
            </Button>
          </form>
          <div className="search-suggestions">
            <span>추천 검색어</span>
            {["오픈런", "오픈핏", "오픈닷"].map((query) => (
              <LocalizedClientLink
                key={query}
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={() => setPanel(null)}
                className="group/search-suggestion outline-none transition-colors duration-150 hover:text-[#c64800] focus-visible:ring-2 focus-visible:ring-[#c64800]/40 motion-reduce:transition-none"
              >
                {query}
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={14}
                  className="transition-transform duration-150 ease-out group-hover/search-suggestion:translate-x-0.5 group-focus-visible/search-suggestion:translate-x-0.5 motion-reduce:!transform-none motion-reduce:transition-none"
                />
              </LocalizedClientLink>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import branding from "@/content/branding.json"
import { useParams, usePathname } from "next/navigation"
import { useCompare } from "@lib/context/compare-context"
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
        <LocalizedClientLink href="/pages/membership">
          멤버십 알아보기 <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
        </LocalizedClientLink>
      </div>
      <header className="main-header content-container">
        <Button
          className="mobile-menu-button"
          variant="ghost"
          size="icon"
          aria-label="메뉴 열기"
          onClick={() => setPanel("menu")}
        >
          <HugeiconsIcon icon={Menu01Icon} />
        </Button>
        <LocalizedClientLink
          href="/"
          className="shokz-logo"
          aria-label="Shokz 홈"
        >
          <Image
            src={branding.logo}
            alt="SHOKZ"
            width={187}
            height={55}
            priority
            className="brand-logo-image"
          />
        </LocalizedClientLink>
        <nav className="primary-nav" aria-label="주 메뉴">
          {navigation.map((link) =>
            link.children.length ? (
              <Popover key={link.title}>
                <PopoverTrigger render={<Button variant="ghost" size="sm" />}>
                  {link.title}
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    data-icon="inline-end"
                  />
                </PopoverTrigger>
                <PopoverContent align="start" className="nav-menu-content">
                  <LocalizedClientLink
                    href={link.href}
                    className="nav-panel-title"
                  >
                    {link.title} 알아보기
                    <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
                  </LocalizedClientLink>
                  {link.children.map(([title, href]) => (
                    <LocalizedClientLink key={href} href={href}>
                      {title}
                    </LocalizedClientLink>
                  ))}
                </PopoverContent>
              </Popover>
            ) : (
              <LocalizedClientLink
                className={buttonVariants({ variant: "ghost", size: "sm" })}
                href={link.href}
                key={link.title}
              >
                {link.title}
              </LocalizedClientLink>
            )
          )}
          <LocalizedClientLink
            className={buttonVariants({ variant: "ghost", size: "sm" })}
            href="/journal"
          >
            샥즈 소식
          </LocalizedClientLink>
        </nav>
        <div className="header-tools">
          {handles.length > 0 && (
            <LocalizedClientLink
              href={"/compare?products=" + handles.join(",")}
              className={buttonVariants({
                variant: "ghost",
                size: "icon",
                className: "nav-compare-link",
              })}
              aria-label={"선택한 " + handles.length + "개 제품 비교하기"}
            >
              <HugeiconsIcon icon={GitCompareIcon} />
              <span className="nav-compare-count" aria-hidden="true">
                {handles.length}
              </span>
            </LocalizedClientLink>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label="제품 검색"
            onClick={() => setPanel("search")}
          >
            <HugeiconsIcon icon={Search01Icon} />
          </Button>
          <LocalizedClientLink
            className="icon-button account-icon"
            href="/account"
            aria-label="마이페이지"
          >
            <HugeiconsIcon icon={UserIcon} size={22} />
          </LocalizedClientLink>
          {cart}
        </div>
      </header>
      <Sheet
        open={panel === "menu"}
        onOpenChange={(open) => setPanel(open ? "menu" : null)}
      >
        <SheetContent side="left" className="mobile-nav-sheet">
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
            <Accordion multiple>
              {navigation.map((link) => (
                <AccordionItem value={link.title} key={link.title}>
                  {link.children.length ? (
                    <>
                      <AccordionTrigger>{link.title}</AccordionTrigger>
                      <AccordionContent>
                        <div className="mobile-nav-links">
                          <LocalizedClientLink
                            onClick={() => setPanel(null)}
                            href={link.href}
                          >
                            전체 보기
                          </LocalizedClientLink>
                          {link.children.map(([title, href]) => (
                            <LocalizedClientLink
                              onClick={() => setPanel(null)}
                              key={href}
                              href={href}
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
                      className="mobile-nav-direct"
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
              className="mobile-nav-direct"
            >
              샥즈 소식 & 이벤트
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/account"
              onClick={() => setPanel(null)}
              className="mobile-nav-direct"
            >
              마이페이지
            </LocalizedClientLink>
            <Button variant="outline" onClick={() => setPanel("search")}>
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
        <SheetContent side="top" className="search-sheet">
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
              />
            </Field>
            <Button size="lg" type="submit">
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
              >
                {query}
                <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
              </LocalizedClientLink>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import Image from "@modules/common/components/store-image"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import Register from "@modules/account/components/register"
import Login from "@modules/account/components/login"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import home from "@/content/home.json"

export enum LOGIN_VIEW {
  SIGN_IN = "sign-in",
  REGISTER = "register",
}

const LoginTemplate = () => {
  const [currentView, setCurrentView] = useState(LOGIN_VIEW.SIGN_IN)
  const panel = useRef<HTMLDivElement>(null)
  const previousView = useRef(currentView)

  useEffect(() => {
    if (previousView.current === currentView) return
    previousView.current = currentView
    panel.current?.querySelector("h1")?.focus({ preventScroll: true })
  }, [currentView])

  return (
    <section
      className="mx-auto grid w-full max-w-[1180px] grid-cols-[minmax(0,.95fr)_minmax(0,1.05fr)] overflow-hidden rounded-2xl border border-border bg-card max-[1000px]:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] max-[900px]:block max-[900px]:max-w-[540px] max-[480px]:rounded-none max-[480px]:border-0"
      aria-label="샥즈 계정"
    >
      <aside
        className="relative isolate min-h-[640px] overflow-hidden bg-[#161d25] max-[900px]:hidden"
        aria-label="샥즈 브랜드 스토리"
      >
        {/* 横幅在窄栏按高度裁切，取图宽度需覆盖完整画幅，保持人像清晰。 */}
        <Image
          src={home.athletes[0].image}
          alt="샥즈 오픈이어 이어폰을 착용한 브랜드 앰버서더 지창욱"
          fill
          sizes="(max-width: 900px) 0px, 1800px"
          quality={90}
          className="-z-20 object-cover object-[67%_center]"
          loading="eager"
        />
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-[#10171c] via-transparent to-[#0b1217]/25"
          aria-hidden="true"
        />
        <span className="absolute left-9 top-8 text-[10px] font-semibold tracking-[.2em] text-white">
          SHOKZ ACCOUNT
        </span>
        <div className="absolute bottom-[46px] left-9 right-7 text-white max-[1000px]:left-7">
          <p className="mb-[22px] font-sans text-[clamp(48px,5.5vw,76px)] font-extrabold leading-[.98] tracking-[-.065em] max-[1000px]:text-[52px]">
            OPEN YOUR
            <br />
            WORLD.
          </p>
          <span className="text-sm text-[#f2eee8]">
            귀를 열고, 가능성을 열다.
          </span>
        </div>
      </aside>
      <div
        className="flex min-w-0 flex-col px-[clamp(32px,4vw,56px)] pb-[26px] pt-[30px] max-[1000px]:px-8 max-[900px]:px-[34px] max-[900px]:pb-6 max-[900px]:pt-[22px] max-[480px]:px-6 max-[480px]:pb-7 max-[480px]:pt-5"
        ref={panel}
      >
        <LocalizedClientLink
          href="/store"
          className="inline-flex min-h-10 items-center gap-2 self-start text-[11px] font-medium text-muted-foreground hover:text-accent-foreground max-[480px]:min-h-9"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={17} aria-hidden="true" />
          쇼핑 계속하기
        </LocalizedClientLink>
        <div
          key={currentView}
          className="flex flex-1 items-center pb-[34px] pt-[30px] max-[900px]:py-6 max-[480px]:pb-[30px]"
        >
          {currentView === LOGIN_VIEW.SIGN_IN ? (
            <Login setCurrentView={setCurrentView} />
          ) : (
            <Register setCurrentView={setCurrentView} />
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3.5 border-t border-border pt-5 max-[480px]:gap-2.5">
          <div>
            <strong className="text-[11px] font-medium text-foreground">
              궁금한 점이 있으신가요?
            </strong>
            <p className="mt-1.5 text-[10px] leading-[1.75] text-muted-foreground">
              자주 묻는 질문과 서비스 안내를 확인하세요.
            </p>
          </div>
          <LocalizedClientLink
            href="/pages/support"
            className="inline-flex min-h-[38px] items-center gap-2 text-[11px] font-medium text-foreground hover:text-accent-foreground"
          >
            고객지원
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              size={17}
              aria-hidden="true"
            />
          </LocalizedClientLink>
        </div>
      </div>
    </section>
  )
}

export default LoginTemplate

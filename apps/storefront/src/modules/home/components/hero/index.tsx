"use client"

import { useRef, useState } from "react"
import Image from "@modules/common/components/store-image"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  PauseIcon,
  PlayIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "@lib/utils"
import { Button, buttonVariants } from "@modules/common/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@modules/common/components/ui/dialog"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import home from "@/content/home.json"

export default function Hero() {
  const [active, setActive] = useState(0)
  const video = useRef<HTMLVideoElement>(null)
  const touch = useRef({ x: 0, y: 0 })
  const [playing, setPlaying] = useState(false)
  const [videoOpen, setVideoOpen] = useState(false)
  const [muted, setMuted] = useState(true)
  const campaign = home.campaigns[active]

  function selectCampaign(index: number) {
    if (index === active) return
    setActive(index)
    setPlaying(false)
    setVideoOpen(false)
  }

  function navigate(direction: number) {
    selectCampaign(
      (active + direction + home.campaigns.length) % home.campaigns.length
    )
  }

  return (
    <section
      className="campaign-hero relative isolate mt-7 aspect-[590/831] w-full overflow-hidden bg-[#17242c] outline-offset-[-4px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#ff813f] md:mt-8 md:aspect-[2.25]"
      aria-label="Shokz 캠페인"
      aria-roledescription="carousel"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault()
          navigate(event.key === "ArrowLeft" ? -1 : 1)
        }
      }}
      onTouchStart={(event) => {
        // 播放弹层使用 Portal，轮播手势只处理实际位于自身画布内的触摸。
        if (!event.currentTarget.contains(event.target as Node)) return
        touch.current = {
          x: event.touches[0].clientX,
          y: event.touches[0].clientY,
        }
      }}
      onTouchEnd={(event) => {
        if (!event.currentTarget.contains(event.target as Node)) return
        const dx = event.changedTouches[0].clientX - touch.current.x
        const dy = event.changedTouches[0].clientY - touch.current.y
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy))
          navigate(dx < 0 ? 1 : -1)
      }}
    >
      <h1 className="sr-only">SHOKZ · 귀를 열고, 세상을 넓히다</h1>
      {"video" in campaign.desktop ? (
        <div className="absolute inset-0">
          {/* 横幅在竖屏按高度裁切，按实际绘制宽度取图，避免人像被低分辨率放大。 */}
          <Image
            src={campaign.poster}
            alt="지창욱 Shokz 브랜드 캠페인"
            fill
            sizes="(max-width: 767px) 1800px, 100vw"
            quality={90}
            loading="eager"
            className="h-full w-full object-cover object-[62%_center]"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#10191fc9_0%,#10191f66_38%,#10191f00_75%)]"
            aria-hidden="true"
          />
          <div className="absolute left-[8%] top-[39%] max-w-[75%] text-white md:top-[34%]">
            <p className="mb-4 text-[9px] font-semibold tracking-[0.18em] md:text-[11px]">
              OPEN YOUR WORLD
            </p>
            <h2 className="mb-6 text-[34px] font-semibold leading-[1.4] tracking-[-0.04em] [text-shadow:0_2px_18px_#0006] md:mb-8 md:text-[clamp(34px,4vw,62px)]">
              나의 모든 순간에,
              <br />
              샥즈.
            </h2>
            <LocalizedClientLink
              href={campaign.href}
              className={buttonVariants({
                size: "lg",
                variant: "secondary",
                className:
                  "min-h-11 gap-4 bg-white px-5 text-xs hover:bg-[#ff813f] md:px-7 md:text-sm",
              })}
            >
              샥즈 스쿼드 만나보기
              <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
            </LocalizedClientLink>
          </div>
          <Dialog
            open={videoOpen}
            onOpenChange={(open) => {
              setVideoOpen(open)
              if (!open) {
                video.current?.pause()
                setPlaying(false)
                setMuted(true)
              }
            }}
          >
            <DialogTrigger
              render={
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-5 top-[112px] h-11 w-11 rounded-full bg-white hover:bg-[#ff813f] md:right-[5vw] md:top-[145px] md:h-12 md:w-12"
                  aria-label="브랜드 영상 재생"
                />
              }
            >
              <HugeiconsIcon icon={PlayIcon} />
            </DialogTrigger>
            <DialogContent className="max-h-[92dvh] gap-0 overflow-hidden border border-[#3b4246] bg-[#11171b] p-0 text-white sm:max-w-[1100px]">
              <DialogHeader className="px-5 py-5 pr-14">
                <DialogTitle className="text-sm font-medium tracking-[0.03em]">
                  지창욱 × SHOKZ
                </DialogTitle>
                <DialogDescription className="sr-only">
                  오픈닷 2 공식 브랜드 영상
                </DialogDescription>
              </DialogHeader>
              {/* 品牌片包含字幕和产品画面，独立播放并完整保留原片构图。 */}
              <video
                ref={video}
                autoPlay
                playsInline
                muted={muted}
                preload="metadata"
                className="aspect-[32/45] max-h-[70dvh] w-full bg-black object-contain md:aspect-video"
                aria-label="지창욱 × SHOKZ 공식 브랜드 영상"
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)}
              >
                <source
                  src={campaign.mobile.video}
                  media="(max-width: 767px)"
                  type="video/mp4"
                />
                <source src={campaign.desktop.video} type="video/mp4" />
              </video>
              <div className="flex items-center justify-between border-t border-[#343c41] px-4 py-2">
                <Button
                  type="button"
                  variant="ghost"
                  className="gap-2 text-xs text-white hover:bg-[#273138] hover:text-white"
                  aria-label={playing ? "영상 일시 정지" : "영상 계속 재생"}
                  onClick={() =>
                    playing ? video.current?.pause() : video.current?.play()
                  }
                >
                  <HugeiconsIcon
                    icon={playing ? PauseIcon : PlayIcon}
                    size={17}
                  />
                  {playing ? "일시 정지" : "재생"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-xs text-white hover:bg-[#273138] hover:text-white"
                  aria-pressed={!muted}
                  onClick={() => setMuted(!muted)}
                >
                  {muted ? "소리 켜기" : "소리 끄기"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <LocalizedClientLink
          href={campaign.href}
          className="campaign-image absolute inset-0 block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-5px] focus-visible:outline-[#ff813f]"
          aria-label={campaign.title + " 제품 보기"}
        >
          <picture className="relative block h-full w-full">
            <source media="(max-width: 767px)" srcSet={campaign.mobile.image} />
            <Image
              key={campaign.poster}
              src={campaign.desktop.image}
              alt={campaign.title + " Shokz 브랜드 캠페인"}
              fill
              loading="eager"
              fetchPriority={active === 0 ? "high" : "auto"}
              quality={90}
              sizes="100vw"
              className="h-full w-full object-cover object-center motion-safe:animate-[campaign-enter_700ms_cubic-bezier(0.22,1,0.36,1)]"
            />
          </picture>
        </LocalizedClientLink>
      )}
      <div className="content-container pointer-events-none absolute inset-x-0 bottom-4 flex items-center justify-between gap-2 text-white md:bottom-7 md:gap-6">
        <div
          className="pointer-events-auto flex shrink-0 items-center gap-3 [text-shadow:0_1px_8px_#0009] md:w-[250px] md:gap-4"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className="font-sans text-[28px] font-medium leading-none tracking-[-0.05em] md:text-[38px]">
            {String(active + 1).padStart(2, "0")}
          </span>
          <span className="sr-only md:hidden">{campaign.title}</span>
          <div className="hidden gap-1 border-l border-white/60 pl-4 md:grid">
            <span className="hidden text-[10px] tracking-[0.1em] md:block">
              {campaign.english_name}
            </span>
            <small className="text-[9px] md:text-[11px]">
              {campaign.title}
            </small>
          </div>
        </div>
        <div
          className="pointer-events-auto flex shrink-0 items-center gap-1"
          aria-label="캠페인 선택"
        >
          {home.campaigns.map((item, index) => (
            <Button
              variant="ghost"
              size="sm"
              key={item.title}
              className="group h-11 w-9 rounded-none px-0 hover:bg-transparent focus-visible:ring-[#ff813f] md:w-11"
              aria-current={active === index ? "true" : undefined}
              aria-label={item.title + " 캠페인 보기"}
              onClick={() => selectCampaign(index)}
            >
              <span
                className={cn(
                  "h-[2px] transition-[width,background-color] duration-200 group-hover:bg-white",
                  active === index
                    ? "w-6 bg-[#ff813f] md:w-8"
                    : "w-3.5 bg-[#d2d9dc] md:w-5"
                )}
              />
            </Button>
          ))}
        </div>
        <div className="pointer-events-auto flex shrink-0 justify-end gap-2 md:w-[250px] md:gap-3">
          <Button
            variant="secondary"
            size="icon"
            className="h-11 w-11 rounded-full border border-white bg-white text-[#171717] transition-[background-color,transform] hover:-translate-y-0.5 hover:border-[#ff813f] hover:bg-[#ff813f] md:h-[50px] md:w-[50px]"
            aria-label="이전 캠페인"
            onClick={() => navigate(-1)}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="h-11 w-11 rounded-full border border-white bg-white text-[#171717] transition-[background-color,transform] hover:-translate-y-0.5 hover:border-[#ff813f] hover:bg-[#ff813f] md:h-[50px] md:w-[50px]"
            aria-label="다음 캠페인"
            onClick={() => navigate(1)}
          >
            <HugeiconsIcon icon={ArrowRight01Icon} />
          </Button>
        </div>
      </div>
    </section>
  )
}

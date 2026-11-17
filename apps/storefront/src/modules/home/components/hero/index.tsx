"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  PauseIcon,
  PlayIcon,
} from "@hugeicons/core-free-icons"
import { Button, buttonVariants } from "@modules/common/components/ui/button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import home from "@/content/home.json"

export default function Hero() {
  const [active, setActive] = useState(0)
  const video = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)
  const campaign = home.campaigns[active]
  const navigate = (direction: number) => {
    setActive(
      (active + direction + home.campaigns.length) % home.campaigns.length
    )
    setPlaying(false)
  }
  return (
    <section className="campaign-hero" aria-label="Shokz 캠페인">
      <h1 className="sr-only">SHOKZ · 귀를 열고, 세상을 넓히다</h1>
      {"video" in campaign.desktop ? (
        <div className="campaign-video">
          <video
            key={campaign.desktop.video}
            ref={video}
            playsInline
            muted
            loop
            preload="metadata"
            poster={campaign.poster}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
          >
            <source src={campaign.desktop.video} type="video/mp4" />
          </video>
          <div className="campaign-video-copy">
            <p className="eyebrow">OPEN YOUR WORLD</p>
            <h2>
              나의 모든 순간에,
              <br />
              샥즈.
            </h2>
            <LocalizedClientLink
              href={campaign.href}
              className={buttonVariants({ size: "lg", variant: "secondary" })}
            >
              샥즈 스쿼드 만나보기
              <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
            </LocalizedClientLink>
          </div>
          <Button
            variant="secondary"
            size="icon"
            className="campaign-video-control"
            aria-label={playing ? "영상 일시 정지" : "브랜드 영상 재생"}
            onClick={() =>
              playing ? video.current?.pause() : video.current?.play()
            }
          >
            <HugeiconsIcon icon={playing ? PauseIcon : PlayIcon} />
          </Button>
        </div>
      ) : (
        <LocalizedClientLink
          href={campaign.href}
          className="campaign-image"
          aria-label={campaign.title + " 제품 보기"}
        >
          <picture>
            <source media="(max-width: 767px)" srcSet={campaign.mobile.image} />
            <Image
              key={campaign.poster}
              src={campaign.desktop.image}
              alt={campaign.title + " Shokz 브랜드 캠페인"}
              fill
              loading="eager"
              quality={90}
              sizes="100vw"
            />
          </picture>
        </LocalizedClientLink>
      )}
      <div className="campaign-controls content-container">
        <div className="campaign-pagination">
          <span>{String(active + 1).padStart(2, "0")}</span>
          <div>
            {home.campaigns.map((item, index) => (
              <Button
                variant="ghost"
                size="sm"
                key={item.title}
                aria-current={active === index}
                aria-label={item.title + " 캠페인 보기"}
                onClick={() => {
                  setActive(index)
                  setPlaying(false)
                }}
              >
                <span />
              </Button>
            ))}
          </div>
          <span>{String(home.campaigns.length).padStart(2, "0")}</span>
        </div>
        <div className="campaign-arrows">
          <Button
            variant="secondary"
            size="icon"
            aria-label="이전 캠페인"
            onClick={() => navigate(-1)}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} />
          </Button>
          <Button
            variant="secondary"
            size="icon"
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

"use client"

import { useCallback, useId, useState, useSyncExternalStore } from "react"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@lib/utils"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@modules/common/components/ui/carousel"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@modules/common/components/ui/card"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@modules/common/components/ui/toggle-group"
import home from "@/content/home.json"

export default function BenefitsCarousel() {
  const [api, setApi] = useState<CarouselApi>()
  const contentId = useId()

  const subscribe = useCallback(
    (update: () => void) => {
      if (!api) return () => {}
      api.on("select", update)
      api.on("reInit", update)
      return () => {
        api.off("select", update)
        api.off("reInit", update)
      }
    },
    [api]
  )
  const selected = useSyncExternalStore(
    subscribe,
    () => api?.selectedScrollSnap() ?? 0,
    () => 0
  )
  const pageCount = useSyncExternalStore(
    subscribe,
    () => api?.scrollSnapList().length ?? 0,
    () => 0
  )

  return (
    <div className="min-w-0">
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          slidesToScroll: "auto",
          duration: 26,
          breakpoints: {
            "(prefers-reduced-motion: reduce)": { duration: 0 },
          },
        }}
        aria-label="공식몰 서비스"
        aria-describedby={pageCount > 1 ? `${contentId}-hint` : undefined}
        tabIndex={pageCount > 1 ? 0 : undefined}
        className="rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-muted"
      >
        <CarouselContent
          id={contentId}
          className={cn(
            "-ml-4 select-none touch-pan-y touch-pinch-zoom",
            pageCount > 1 && "cursor-grab active:cursor-grabbing"
          )}
        >
          {/* 固定服务入口比例，让桌面并排呈现更多服务，而不是随轮播容器放大。 */}
          {home.benefits.map((benefit, index) => (
            <CarouselItem
              key={benefit.id}
              aria-label={`${index + 1} / ${home.benefits.length}`}
              className="basis-[236px] py-1 pl-4"
            >
              <LocalizedClientLink
                href={benefit.href}
                aria-label={`${benefit.title} 자세히 보기`}
                draggable={false}
                className={cn(
                  "group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                  pageCount > 1 && "cursor-grab active:cursor-grabbing"
                )}
              >
                <Card className="h-[300px] gap-0 rounded-xl py-0 ring-inset transition-[background-color,box-shadow] duration-200 group-hover:bg-accent group-hover:ring-primary/50 group-focus-visible:bg-accent group-focus-visible:ring-primary [--card-spacing:1rem] motion-reduce:transition-none">
                  <CardContent className="relative flex h-[180px] shrink-0 items-center justify-center">
                    <span
                      className="absolute left-4 top-4 text-[11px] font-medium tabular-nums tracking-[0.12em] text-muted-foreground"
                      aria-hidden="true"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    {benefit.image && (
                      <Image
                        src={benefit.image}
                        alt=""
                        width={180}
                        height={180}
                        draggable={false}
                          className="size-36 object-contain motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.04] motion-safe:group-focus-visible:scale-[1.04]"
                      />
                    )}
                  </CardContent>
                  <CardHeader className="gap-1.5 pb-0">
                    <CardTitle className="text-lg font-semibold">
                      <h3>{benefit.title}</h3>
                    </CardTitle>
                    <CardDescription className="min-h-10 text-xs leading-5">
                      {benefit.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="mt-auto justify-between border-0 bg-transparent px-4 pb-3 pt-1">
                    <span className="text-[10px] font-medium text-muted-foreground transition-colors duration-200 group-hover:text-foreground group-focus-visible:text-foreground motion-reduce:transition-none">
                      자세히 보기
                    </span>
                    <span
                      className="flex size-6 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors duration-200 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground group-focus-visible:border-primary group-focus-visible:bg-primary group-focus-visible:text-primary-foreground motion-reduce:transition-none"
                      aria-hidden="true"
                    >
                      <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} />
                    </span>
                  </CardFooter>
                </Card>
              </LocalizedClientLink>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {pageCount > 1 && (
        <div className="mt-3 flex min-h-11 flex-wrap items-center justify-between gap-x-5 md:flex-nowrap">
          <p
            id={`${contentId}-hint`}
            className="shrink-0 text-[10px] text-muted-foreground"
          >
            드래그해 더 보기
          </p>
          <ToggleGroup
            aria-label="서비스 페이지 선택"
            value={[String(selected)]}
            onValueChange={(values) => {
              if (!values[0]) return
              api?.scrollTo(
                Number(values[0]),
                window.matchMedia("(prefers-reduced-motion: reduce)").matches
              )
            }}
            spacing={2}
            className="order-last w-full md:order-none md:max-w-60"
          >
            {Array.from({ length: pageCount }, (_, index) => (
              <ToggleGroupItem
                key={index}
                value={String(index)}
                aria-label={`${index + 1}페이지 보기`}
                aria-controls={contentId}
                className="group/step h-11 min-w-0 flex-1 rounded-none px-0 hover:bg-transparent data-[pressed]:bg-transparent focus-visible:ring-inset"
              >
                <span
                  className="h-[2px] w-full bg-border transition-colors duration-200 group-hover/step:bg-muted-foreground group-data-[pressed]/step:bg-primary motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <span className="shrink-0 text-[11px] font-medium tabular-nums text-muted-foreground">
            {String(selected + 1).padStart(2, "0")} /{" "}
            {String(pageCount).padStart(2, "0")}
          </span>
        </div>
      )}
    </div>
  )
}

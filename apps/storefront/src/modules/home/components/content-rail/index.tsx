"use client"

import { useEffect, useId, useRef, useState, type ReactNode } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { cn } from "@lib/utils"
import { Button } from "@modules/common/components/ui/button"

export default function ContentRail({
  children,
  className,
  label,
  itemCount,
  action,
}: {
  children: ReactNode
  className: string
  label: string
  itemCount: number
  action?: ReactNode
}) {
  const id = useId()
  const rail = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({
    start: true,
    end: true,
    first: 1,
    last: itemCount,
    left: 0,
    width: 100,
  })

  useEffect(() => {
    const element = rail.current!
    const update = () => {
      // 未激活的标签面板没有可测量宽度，重新显示时由 ResizeObserver 更新。
      if (!element.clientWidth) return
      const bounds = element.getBoundingClientRect()
      const visible = Array.from(element.children)
        .map((child, index) => ({ rect: child.getBoundingClientRect(), index }))
        .filter(
          ({ rect }) =>
            rect.right > bounds.left + 2 && rect.left < bounds.right - 2
        )

      setPosition({
        start: element.scrollLeft <= 2,
        end:
          element.scrollLeft + element.clientWidth >= element.scrollWidth - 2,
        first: (visible[0]?.index ?? 0) + 1,
        last: (visible.at(-1)?.index ?? 0) + 1,
        left: (element.scrollLeft / element.scrollWidth) * 100,
        width: (element.clientWidth / element.scrollWidth) * 100,
      })
    }
    const observer = new ResizeObserver(update)
    observer.observe(element)
    element.addEventListener("scroll", update, { passive: true })
    update()
    return () => {
      observer.disconnect()
      element.removeEventListener("scroll", update)
    }
  }, [itemCount])

  function scroll(direction: number) {
    const element = rail.current!
    element.scrollBy({
      left: direction * element.clientWidth,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    })
  }

  return (
    <div className="home-content-rail min-w-0">
      <div
        id={id}
        ref={rail}
        className={cn(
          "overflow-x-auto overscroll-x-contain [scroll-snap-type:x_mandatory] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ff6008]",
          className
        )}
        role="region"
        aria-label={label}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault()
            scroll(event.key === "ArrowLeft" ? -1 : 1)
          }
        }}
      >
        {children}
      </div>
      <div className="mt-5 flex min-h-11 flex-wrap items-center justify-between gap-4">
        {action}
        <div className="ml-auto flex items-center gap-3">
          <span
            className="text-[11px] font-medium tabular-nums tracking-[0.03em]"
            aria-label={`${itemCount}개 중 ${position.first}–${position.last}`}
          >
            {String(position.first).padStart(2, "0")}
            {position.last !== position.first &&
              `—${String(position.last).padStart(2, "0")}`}
            <span className="text-[#89847b]">
              {" "}
              / {String(itemCount).padStart(2, "0")}
            </span>
          </span>
          <div
            className="relative mx-2 hidden h-[2px] w-24 overflow-hidden bg-[#e3dfd6] sm:block"
            aria-hidden="true"
          >
            <span
              className="absolute top-0 h-full bg-[#c75a22]"
              style={{ left: `${position.left}%`, width: `${position.width}%` }}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-full border-[#d9d4ca] bg-white transition-[background-color,border-color,transform] hover:-translate-y-0.5 hover:border-[#ff6008] hover:bg-[#ff6008] disabled:opacity-30"
            aria-label={`이전 ${label}`}
            aria-controls={id}
            disabled={position.start}
            onClick={() => scroll(-1)}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-11 w-11 rounded-full border-[#d9d4ca] bg-white transition-[background-color,border-color,transform] hover:-translate-y-0.5 hover:border-[#ff6008] hover:bg-[#ff6008] disabled:opacity-30"
            aria-label={`다음 ${label}`}
            aria-controls={id}
            disabled={position.end}
            onClick={() => scroll(1)}
          >
            <HugeiconsIcon icon={ArrowRight01Icon} />
          </Button>
        </div>
      </div>
    </div>
  )
}

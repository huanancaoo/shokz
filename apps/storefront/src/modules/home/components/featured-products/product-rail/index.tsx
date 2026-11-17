"use client"

import { useLayoutEffect, useRef } from "react"
import type { HttpTypes } from "@medusajs/types"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import ProductPreview from "@modules/products/components/product-preview"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ContentRail from "@modules/home/components/content-rail"

export type SceneCard = {
  handle: string
  scene: string | null
  mobile_scene: string | null
  description: string
  english_name: string
}

export default function ProductRail({
  products,
  cards,
}: {
  products: HttpTypes.StoreProduct[]
  cards: SceneCard[]
}) {
  const content = useRef<HTMLDivElement>(null)
  const availableCards = cards.flatMap((card) => {
    const product = products.find((product) => product.handle === card.handle)
    return product ? [{ card, product }] : []
  })

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    // 整组仅轻微改变透明度，保持切换时布局静止，避免位移和错峰造成晃眼。
    const animation = content.current!.animate(
      [{ opacity: 0.88 }, { opacity: 1 }],
      { duration: 160, easing: "ease-out" }
    )

    return () => animation.cancel()
  }, [cards])

  return (
    <div ref={content}>
      <ContentRail
        className="grid min-w-0 auto-cols-[86%] grid-flow-col gap-4 overflow-x-auto overscroll-x-contain pb-2 [scroll-snap-type:x_mandatory] [scrollbar-width:none] md:auto-cols-[calc((100%_-_40px)/3)] md:gap-5 [&::-webkit-scrollbar]:hidden"
        label="제품"
        itemCount={availableCards.length}
        action={
          <LocalizedClientLink
            href="/store"
            className="group inline-flex min-h-11 items-center gap-3 text-xs font-medium text-[#171717] hover:text-[#a1400c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff6008] md:text-[13px]"
          >
            전체 제품 보기
            <HugeiconsIcon
              className="transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none"
              icon={ArrowRight01Icon}
              size={18}
            />
          </LocalizedClientLink>
        }
      >
        {availableCards.map(({ card, product }) => (
          <ProductPreview key={product.id} product={product} scene={card} />
        ))}
      </ContentRail>
    </div>
  )
}

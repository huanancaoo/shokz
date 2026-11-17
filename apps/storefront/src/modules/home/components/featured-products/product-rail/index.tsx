"use client"

import { useRef } from "react"
import type { HttpTypes } from "@medusajs/types"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { Button } from "@modules/common/components/ui/button"
import ProductPreview from "@modules/products/components/product-preview"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

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
  const rail = useRef<HTMLDivElement>(null)
  const scroll = (direction: number) => {
    if (rail.current)
      rail.current.scrollBy({
        left: direction * rail.current.clientWidth,
        behavior: "smooth",
      })
  }
  return (
    <>
      <div className="scene-product-rail" ref={rail}>
        {cards.map((card) => {
          const product = products.find(
            (product) => product.handle === card.handle
          )
          return (
            product && (
              <ProductPreview key={product.id} product={product} scene={card} />
            )
          )
        })}
      </div>
      <div className="lineup-controls">
        <LocalizedClientLink href="/store" className="text-link">
          전체 제품 보기
          <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
        </LocalizedClientLink>
        <div>
          <Button
            variant="outline"
            size="icon"
            aria-label="이전 제품"
            onClick={() => scroll(-1)}
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="다음 제품"
            onClick={() => scroll(1)}
          >
            <HugeiconsIcon icon={ArrowRight01Icon} />
          </Button>
        </div>
      </div>
    </>
  )
}

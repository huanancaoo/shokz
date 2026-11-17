"use client"

import { useId, useState } from "react"
import Image from "next/image"
import type { HttpTypes } from "@medusajs/types"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { CompareToggle } from "@lib/context/compare-context"
import { productMetadata } from "@lib/util/product"
import { cn } from "@lib/utils"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Badge } from "@modules/common/components/ui/badge"
import { Button, buttonVariants } from "@modules/common/components/ui/button"
import { Card } from "@modules/common/components/ui/card"
import type { SceneCard } from "../product-rail"

export default function HomeProductCard({
  product,
  scene,
  amount,
}: {
  product: HttpTypes.StoreProduct
  scene: SceneCard
  amount?: string
}) {
  const [showScene, setShowScene] = useState(false)
  const mediaId = useId()
  const data = productMetadata(product)
  const productHref = "/products/" + product.handle

  return (
    <Card
      role="article"
      className="relative min-w-0 snap-start gap-0 rounded-2xl border border-[#e5e2db] bg-[#f3f2ef] py-0 text-[#171717] ring-0 transition-colors duration-200 hover:border-[#bcb5a8] focus-within:border-[#ff6008] motion-reduce:transition-none"
      data-testid="product-wrapper"
    >
      <div className="flex min-h-14 items-center justify-between gap-3 px-5 pt-2 md:px-6">
        {data?.badge?.[0] && (
          <Badge className="h-5 rounded-[4px] border-0 bg-[#171717] px-2 text-[9px] font-semibold tracking-[0.09em] text-white">
            {data.badge[0]}
          </Badge>
        )}
        {data?.comparable && (
          <div className="ml-auto">
            <CompareToggle handle={product.handle!} />
          </div>
        )}
      </div>

      <div className="px-5 pt-2 md:px-6">
        <h3 className="text-[27px] font-semibold leading-[1.15] tracking-[-0.045em] md:text-[30px]">
          {scene.english_name}
        </h3>
        <p className="mt-1.5 text-xs text-[#716b63]">{product.title}</p>
      </div>

      <div
        id={mediaId}
        className="relative mx-3 my-3 aspect-[1.18] overflow-hidden rounded-xl md:mx-4"
      >
        <LocalizedClientLink
          href={productHref}
          aria-label={product.title + " 제품 알아보기"}
          className="absolute inset-0 rounded-xl outline-none focus-visible:ring-[3px] focus-visible:ring-inset focus-visible:ring-[#ff6008]"
        >
          {/* SPU 主图代表产品形态；SKU 相册首张可能是人物图，不能用于首页主视觉。 */}
          {product.thumbnail && (
            <Image
              src={product.thumbnail}
              alt={product.title + " 제품"}
              fill
              sizes="(max-width: 767px) 80vw, 30vw"
              className={cn(
                "scale-[1.16] object-contain transition-opacity duration-200 motion-reduce:transition-none",
                showScene ? "opacity-0" : "opacity-100"
              )}
              aria-hidden={showScene}
            />
          )}
          {scene.scene && (
            <Image
              src={scene.scene}
              alt={product.title + " 착용 장면"}
              fill
              sizes="(max-width: 767px) 80vw, 30vw"
              className={cn(
                "object-cover object-[center_30%] transition-opacity duration-200 motion-reduce:transition-none",
                showScene ? "opacity-100" : "opacity-0"
              )}
              aria-hidden={!showScene}
            />
          )}
        </LocalizedClientLink>

        {scene.scene && (
          <Button
            variant="outline"
            size="sm"
            aria-label={product.title + " 착용컷 보기"}
            aria-pressed={showScene}
            aria-controls={mediaId}
            onClick={() => setShowScene((value) => !value)}
            className="absolute bottom-2 right-2 h-12 gap-2 overflow-hidden rounded-lg border-white bg-white p-1 pr-3 text-[10px] text-[#56514a] shadow-none transition-colors hover:border-[#ff6008] hover:bg-white aria-pressed:border-[#ff6008] aria-pressed:text-[#a73a00] active:translate-y-0 motion-reduce:transition-none"
          >
            <span className="relative h-10 w-8 overflow-hidden rounded-[4px]">
              <Image
                src={scene.scene}
                alt=""
                fill
                sizes="32px"
                className="object-cover"
              />
            </span>
            착용컷
          </Button>
        )}
      </div>

      <div className="mx-5 mt-auto border-t border-[#dedbd3] pb-5 pt-4 md:mx-6 md:pb-6">
        <p className="min-h-10 text-xs leading-[1.7] text-[#716b63]">
          {scene.description}
        </p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <strong className="text-[21px] font-semibold tracking-[-0.04em]">
            {amount}
          </strong>
          <LocalizedClientLink
            href={productHref}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "group/detail h-11 gap-2 rounded-full py-0 pl-3 pr-0 text-[11px] text-[#171717] transition-colors duration-200 hover:bg-transparent hover:text-[#a73a00] active:translate-y-0 motion-reduce:transition-none"
            )}
          >
            제품 보기
            <span className="flex size-11 items-center justify-center rounded-full bg-[#ff6008] text-[#171717] transition-colors duration-200 group-hover/detail:bg-[#171717] group-hover/detail:text-white group-focus-visible/detail:bg-[#171717] group-focus-visible/detail:text-white motion-reduce:transition-none">
              <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
            </span>
          </LocalizedClientLink>
        </div>
      </div>
    </Card>
  )
}

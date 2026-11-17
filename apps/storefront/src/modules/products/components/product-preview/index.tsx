"use client"

import { useState } from "react"
import Image from "next/image"
import type { HttpTypes } from "@medusajs/types"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, StarIcon } from "@hugeicons/core-free-icons"
import { Badge } from "@modules/common/components/ui/badge"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@modules/common/components/ui/toggle-group"
import { buttonVariants } from "@modules/common/components/ui/button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { convertToLocale } from "@lib/util/money"
import { CompareToggle } from "@lib/context/compare-context"
import {
  getAvailableOptionValues,
  productMetadata,
  variantGallery,
} from "@lib/util/product"
import { isVariantInStock } from "@lib/util/inventory"
import type { SceneCard } from "@modules/home/components/featured-products/product-rail"

export default function ProductPreview({
  product,
  scene,
}: {
  product: HttpTypes.StoreProduct
  scene?: SceneCard
}) {
  const [variant, setVariant] = useState(
    product.variants?.find(isVariantInStock) ?? product.variants?.[0]
  )
  const data = productMetadata(product)
  const price = variant?.calculated_price
  const colorOption = product.options?.find((option) => option.title === "색상")
  const image = variantGallery(variant)[0] || product.thumbnail
  const amount =
    price &&
    convertToLocale({
      amount: price.calculated_amount!,
      currency_code: price.currency_code!,
    })
  if (scene)
    return (
      <article className="scene-product-card" data-testid="product-wrapper">
        <LocalizedClientLink
          href={"/products/" + product.handle}
          className="scene-product-link"
        >
          {scene.scene && (
            <picture>
              <source
                media="(max-width: 767px)"
                srcSet={scene.mobile_scene ?? undefined}
              />
              <Image
                src={scene.scene}
                alt={product.title + " 착용 장면"}
                fill
                sizes="(max-width: 767px) 82vw, 31vw"
                loading="lazy"
              />
            </picture>
          )}
          <div className="scene-product-caption">
            <div>
              <span>{scene.english_name}</span>
              <h3>{product.title}</h3>
              <p>{amount}</p>
            </div>
            {image && (
              <div className="scene-product-chip">
                <Image src={image} alt="" width={76} height={76} />
              </div>
            )}
          </div>
          <div className="scene-product-hover">
            {data?.badge?.[0] && (
              <Badge variant="secondary">{data.badge[0]}</Badge>
            )}
            {image && (
              <Image
                src={image}
                alt={product.title}
                width={420}
                height={360}
                loading="lazy"
              />
            )}
            <h3>{product.title}</h3>
            {data?.rating?.avg && (
              <span className="scene-card-rating">
                <HugeiconsIcon icon={StarIcon} size={15} />
                {data.rating.avg}
              </span>
            )}
            <p>{scene.description}</p>
            <strong>{amount}</strong>
            <span
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              제품 알아보기
              <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
            </span>
          </div>
        </LocalizedClientLink>
        {data?.comparable && (
          <div className="scene-card-compare">
            <CompareToggle handle={product.handle!} />
          </div>
        )}
      </article>
    )
  return (
    <article className="shokz-product-card" data-testid="product-wrapper">
      <div className="card-meta">
        <Badge variant="secondary" className="product-badge">
          {data?.badge?.[0] || product.categories?.[0]?.name || "SHOKZ"}
        </Badge>
        {data?.comparable && <CompareToggle handle={product.handle!} />}
      </div>
      <LocalizedClientLink
        href={
          "/products/" + product.handle + (variant ? "?v_id=" + variant.id : "")
        }
        className="product-card-image"
      >
        {image && (
          <Image
            src={image}
            alt={product.title}
            fill
            sizes="(max-width: 767px) 46vw, 31vw"
            loading="lazy"
          />
        )}
      </LocalizedClientLink>
      {colorOption && (
        <ToggleGroup
          className="card-swatches"
          aria-label="색상 미리보기"
          value={
            variant?.options?.find(
              (option) => option.option_id === colorOption.id
            )?.value
              ? [
                  variant.options.find(
                    (option) => option.option_id === colorOption.id
                  )!.value,
                ]
              : []
          }
          onValueChange={(values) => {
            if (values[0])
              setVariant(
                product.variants?.find((item) =>
                  item.options?.some(
                    (option) =>
                      option.option_id === colorOption.id &&
                      option.value === values[0]
                  )
                )
              )
          }}
        >
          {colorOption.values
            ?.filter((value) =>
              getAvailableOptionValues(product, colorOption.id, {}).includes(
                value.value
              )
            )
            .map((value) => (
              <ToggleGroupItem
                key={value.id}
                value={value.value}
                title={value.value}
                aria-label={value.value}
              >
                <span
                  style={{
                    background: data?.swatches?.[value.value]?.length
                      ? "linear-gradient(135deg, " +
                        [
                          ...data.swatches[value.value],
                          data.swatches[value.value][0],
                        ].join(",") +
                        ")"
                      : "#bbb",
                  }}
                />
              </ToggleGroupItem>
            ))}
        </ToggleGroup>
      )}
      <LocalizedClientLink href={"/products/" + product.handle}>
        <h3 data-testid="product-title">{product.title}</h3>
      </LocalizedClientLink>
      <p className="card-description">{product.subtitle}</p>
      <div className="card-price-row">
        <strong>{amount}</strong>
        <LocalizedClientLink
          href={"/products/" + product.handle}
          className="card-arrow"
          aria-label={product.title + " 자세히 보기"}
        >
          <HugeiconsIcon icon={ArrowRight01Icon} size={19} />
        </LocalizedClientLink>
      </div>
    </article>
  )
}

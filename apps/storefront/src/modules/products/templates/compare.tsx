"use client"

import { useEffect, useState } from "react"
import type { HttpTypes } from "@medusajs/types"
import Image from "@modules/common/components/store-image"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  ArrowLeftRightIcon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons"
import { Checkbox } from "@modules/common/components/ui/checkbox"
import { Field, FieldLabel } from "@modules/common/components/ui/field"
import { SelectControl } from "@modules/common/components/ui/select-control"
import { Button, buttonVariants } from "@modules/common/components/ui/button"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@modules/common/components/ui/table"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { getProductPrice } from "@lib/util/get-product-price"
import ProductPreview from "@modules/products/components/product-preview"
import { useCompare } from "@lib/context/compare-context"
import { productMetadata } from "@lib/util/product"

export default function ComparePage({
  products,
  handles: initialHandles,
}: {
  products: HttpTypes.StoreProduct[]
  handles: string[]
}) {
  const [differences, setDifferences] = useState(false)
  const { handles, replace } = useCompare()
  const comparable = products.filter(
    (product) => productMetadata(product)?.comparable
  )
  const key = initialHandles.join(",")
  useEffect(() => {
    replace(key ? key.split(",") : [])
  }, [key, replace])
  const selected = handles
    .map((handle) => comparable.find((product) => product.handle === handle))
    .filter((product): product is HttpTypes.StoreProduct => Boolean(product))
  const keys = [
    ...new Set(
      selected.flatMap((product) =>
        Object.keys(productMetadata(product)?.comparison ?? {})
      )
    ),
  ]
  const rows = keys.filter(
    (key) =>
      !differences ||
      new Set(
        selected.map((product) => productMetadata(product)?.comparison?.[key])
      ).size > 1
  )
  function changeProduct(index: number, handle: string) {
    const next = [...handles]
    next[index] = handle
    replace(next)
  }
  return (
    <div className="comparison-page content-container">
      <p className="eyebrow">FIND YOUR PERFECT MATCH</p>
      <h1>나에게 맞는 샥즈 찾기.</h1>
      <div className="comparison-toolbar">
        <p>
          제품 카드에서 최대 3개까지 선택해 보세요. 선택한 제품이 바로 비교표에
          표시됩니다.
        </p>
        <Field orientation="horizontal" className="w-auto">
          <Checkbox
            id="only-differences"
            checked={differences}
            onCheckedChange={(checked) => setDifferences(Boolean(checked))}
          />
          <FieldLabel htmlFor="only-differences">차이점만 보기</FieldLabel>
        </Field>
        {handles.length > 0 && (
          <Button size="sm" variant="ghost" onClick={() => replace([])}>
            선택 초기화
          </Button>
        )}
      </div>
      {selected.length > 0 && (
        <>
          <p className="comparison-swipe-hint">
            <HugeiconsIcon icon={ArrowLeftRightIcon} size={17} />
            좌우로 밀어 제품을 비교해 보세요.
          </p>
          <div className="comparison-table-wrapper">
            <Table className="comparison-table">
              <TableHeader>
                <TableRow>
                  <TableHead scope="col">제품 비교</TableHead>
                  {selected.map((product, index) => (
                    <TableHead
                      scope="col"
                      key={product.id}
                      className="compare-product-head"
                    >
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="compare-remove"
                        aria-label={product.title + " 비교에서 제외"}
                        onClick={() =>
                          replace(
                            handles.filter(
                              (handle) => handle !== product.handle
                            )
                          )
                        }
                      >
                        <HugeiconsIcon icon={Cancel01Icon} />
                      </Button>
                      <SelectControl
                        value={product.handle!}
                        onValueChange={(value) => {
                          if (value) changeProduct(index, value)
                        }}
                        aria-label={String(index + 1) + "번 비교 제품"}
                        items={comparable
                          .filter(
                            (item) =>
                              !handles.includes(item.handle!) ||
                              item.id === product.id
                          )
                          .map((item) => ({
                            value: item.handle!,
                            label: item.title,
                          }))}
                      />
                      {product.thumbnail && (
                        <Image
                          src={product.thumbnail}
                          alt={product.title}
                          width={300}
                          height={280}
                        />
                      )}
                      <h2>{product.title}</h2>
                      <p>
                        {
                          getProductPrice({ product }).cheapestPrice
                            ?.calculated_price
                        }
                      </p>
                      <LocalizedClientLink
                        href={"/products/" + product.handle}
                        className={buttonVariants({ size: "sm" })}
                      >
                        제품 보기
                        <HugeiconsIcon
                          icon={ArrowRight01Icon}
                          data-icon="inline-end"
                        />
                      </LocalizedClientLink>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((key) => (
                  <TableRow key={key}>
                    <TableHead scope="row">{key}</TableHead>
                    {selected.map((product) => (
                      <TableCell key={product.id}>
                        {productMetadata(product)?.comparison?.[key] ??
                          "공개 정보 없음"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                <TableRow>
                  <TableHead scope="row">가격</TableHead>
                  {selected.map((product) => (
                    <TableCell key={product.id}>
                      {
                        getProductPrice({ product }).cheapestPrice
                          ?.calculated_price
                      }
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </>
      )}
      <section className="compare-picker">
        <h2>
          비교할 제품 선택{" "}
          <span className="text-base text-muted-foreground">
            {selected.length} / 3
          </span>
        </h2>
        <div className="shokz-grid">
          {comparable.map((product) => (
            <ProductPreview key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  )
}

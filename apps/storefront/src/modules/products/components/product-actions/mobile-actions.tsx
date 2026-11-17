"use client"

import type { HttpTypes } from "@medusajs/types"
import { useState } from "react"
import { Button } from "@modules/common/components/ui/button"
import { Spinner } from "@modules/common/components/ui/spinner"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@modules/common/components/ui/sheet"
import { getProductPrice } from "@lib/util/get-product-price"
import {
  getAvailableOptionValues,
  isSimpleProduct,
  productMetadata,
} from "@lib/util/product"
import OptionSelect from "./option-select"

type MobileActionsProps = {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
  options: Record<string, string | undefined>
  updateOptions: (title: string, value: string) => void
  inStock?: boolean
  handleAddToCart: () => void
  isAdding?: boolean
  show: boolean
  optionsDisabled: boolean
}

export default function MobileActions({
  product,
  variant,
  options,
  updateOptions,
  inStock,
  handleAddToCart,
  isAdding,
  show,
  optionsDisabled,
}: MobileActionsProps) {
  const [open, setOpen] = useState(false)
  const prices = getProductPrice({ product, variantId: variant?.id })
  const price = prices.variantPrice ?? prices.cheapestPrice
  return (
    <>
      {show && (
        <div className="mobile-purchase-bar" data-testid="mobile-actions">
          <div>
            <span data-testid="mobile-title">{product.title}</span>
            <strong>{price?.calculated_price}</strong>
          </div>
          <div>
            {!isSimpleProduct(product) && (
              <Button
                variant="outline"
                onClick={() => setOpen(true)}
                data-testid="mobile-actions-button"
              >
                옵션 선택
              </Button>
            )}
            <Button
              onClick={handleAddToCart}
              disabled={!inStock || !variant || isAdding}
              data-testid="mobile-cart-button"
            >
              {isAdding && <Spinner data-icon="inline-start" />}
              {!variant ? "옵션 선택" : !inStock ? "품절" : "장바구니"}
            </Button>
          </div>
        </div>
      )}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="purchase-options-sheet"
          data-testid="mobile-actions-modal"
        >
          <SheetHeader>
            <SheetTitle>{product.title}</SheetTitle>
            <SheetDescription>
              나에게 맞는 색상과 사이즈를 선택해 주세요.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-6 p-6">
            {product.options?.map((option) => (
              <OptionSelect
                key={option.id}
                option={option}
                current={options[option.id]}
                updateOption={updateOptions}
                title={option.title ?? ""}
                name={"mobile-" + option.id}
                disabled={optionsDisabled}
                variantValues={getAvailableOptionValues(product, option.id, {})}
                availableValues={getAvailableOptionValues(
                  product,
                  option.id,
                  options
                )}
                sizeGuideVideo={
                  option.title === "사이즈"
                    ? productMetadata(product)?.size_guide_video
                    : undefined
                }
              />
            ))}
            <Button size="lg" onClick={() => setOpen(false)}>
              선택 완료
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}

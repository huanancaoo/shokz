"use client"

import type { HttpTypes } from "@medusajs/types"
import { useState } from "react"
import { useIsMobile } from "@lib/hooks/use-is-mobile"
import { Button } from "@modules/common/components/ui/button"
import { Spinner } from "@modules/common/components/ui/spinner"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
  DrawerClose,
  DrawerFooter,
} from "@modules/common/components/ui/drawer"
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
  const isMobile = useIsMobile()
  const prices = getProductPrice({ product, variantId: variant?.id })
  const price = prices.variantPrice ?? prices.cheapestPrice
  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      swipeDirection={isMobile ? "down" : "right"}
      showSwipeHandle={isMobile}
    >
      {show && (
        <div className="mobile-purchase-bar" data-testid="mobile-actions">
          <div>
            <span data-testid="mobile-title">{product.title}</span>
            <strong>{price?.calculated_price}</strong>
          </div>
          <div>
            {!isSimpleProduct(product) && (
              <DrawerTrigger
                render={<Button variant="outline" />}
                data-testid="mobile-actions-button"
              >
                옵션 선택
              </DrawerTrigger>
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
      <DrawerContent data-testid="mobile-actions-modal">
        <DrawerHeader>
          <DrawerTitle>{product.title}</DrawerTitle>
          <DrawerDescription>
            나에게 맞는 색상과 사이즈를 선택해 주세요.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-4">
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
        </div>
        <DrawerFooter>
          <DrawerClose render={<Button size="lg" />}>선택 완료</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}

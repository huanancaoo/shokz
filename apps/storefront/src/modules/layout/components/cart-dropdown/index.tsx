"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import type { HttpTypes } from "@medusajs/types"
import { HugeiconsIcon } from "@hugeicons/react"
import { ShoppingBag01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { retrieveCart } from "@lib/data/cart"
import { CART_UPDATED_EVENT } from "@lib/util/cart-events"
import { convertToLocale } from "@lib/util/money"
import { Button, buttonVariants } from "@modules/common/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@modules/common/components/ui/sheet"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
  EmptyContent,
} from "@modules/common/components/ui/empty"
import { Separator } from "@modules/common/components/ui/separator"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import DeleteButton from "@modules/common/components/delete-button"
import Thumbnail from "@modules/products/components/thumbnail"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"

export default function CartDropdown({
  cart: initialCart,
}: {
  cart?: HttpTypes.StoreCart | null
}) {
  const [cart, setCart] = useState(initialCart)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const totalItems =
    cart?.items?.reduce((total, item) => total + item.quantity, 0) ?? 0
  useEffect(() => {
    setCart(initialCart)
  }, [initialCart])
  useEffect(() => {
    async function load() {
      setCart(await retrieveCart())
    }
    function update() {
      void load()
      if (!/\/(cart|checkout)/.test(pathname)) setOpen(true)
    }
    void load()
    window.addEventListener(CART_UPDATED_EVENT, update)
    return () => window.removeEventListener(CART_UPDATED_EVENT, update)
  }, [pathname])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" className="cart-trigger" />}
        aria-label={`장바구니, ${totalItems}개 상품`}
        data-testid="nav-cart-link"
      >
        <HugeiconsIcon icon={ShoppingBag01Icon} />
        {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
      </SheetTrigger>
      <SheetContent className="cart-sheet" data-testid="nav-cart-dropdown">
        <SheetHeader>
          <SheetTitle>
            장바구니{" "}
            <span className="text-muted-foreground">({totalItems})</span>
          </SheetTitle>
          <SheetDescription>
            새로운 사운드를 만날 준비가 되셨나요?
          </SheetDescription>
        </SheetHeader>
        {cart?.items?.length ? (
          <>
            <div className="cart-sheet-items">
              {cart.items.map((item) => (
                <article
                  key={item.id}
                  className="cart-sheet-item"
                  data-testid="cart-item"
                >
                  <LocalizedClientLink
                    href={`/products/${item.product_handle}`}
                    onClick={() => setOpen(false)}
                  >
                    <Thumbnail thumbnail={item.thumbnail} size="square" />
                  </LocalizedClientLink>
                  <div>
                    <LocalizedClientLink
                      href={`/products/${item.product_handle}`}
                      onClick={() => setOpen(false)}
                      className="font-semibold"
                    >
                      {item.title}
                    </LocalizedClientLink>
                    <LineItemOptions variant={item.variant} />
                    <p className="text-xs text-muted-foreground mt-2">
                      수량: {item.quantity}
                    </p>
                    <div className="flex items-center justify-between gap-3 mt-3">
                      <LineItemPrice
                        item={item}
                        currencyCode={cart.currency_code}
                        style="tight"
                      />
                      <DeleteButton id={item.id}>삭제</DeleteButton>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="cart-sheet-summary">
              <Separator />
              <div className="flex items-center justify-between gap-4">
                <span>상품 합계</span>
                <strong data-testid="cart-subtotal">
                  {convertToLocale({
                    amount: cart.item_subtotal ?? 0,
                    currency_code: cart.currency_code,
                  })}
                </strong>
              </div>
              <p className="text-xs text-muted-foreground">
                무료 표준 배송 · 추가 세금 없음
              </p>
              <LocalizedClientLink
                href="/cart"
                onClick={() => setOpen(false)}
                className={buttonVariants({ size: "lg" })}
                data-testid="go-to-cart-button"
              >
                장바구니 보기
                <HugeiconsIcon icon={ArrowRight01Icon} data-icon="inline-end" />
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/checkout"
                onClick={() => setOpen(false)}
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                주문하기
              </LocalizedClientLink>
            </div>
          </>
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HugeiconsIcon icon={ShoppingBag01Icon} />
              </EmptyMedia>
              <EmptyTitle>아직 비어 있는 장바구니</EmptyTitle>
              <EmptyDescription>
                당신의 일상에 어울리는 샥즈를 찾아보세요.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <LocalizedClientLink
                href="/store"
                onClick={() => setOpen(false)}
                className={buttonVariants()}
              >
                제품 둘러보기
              </LocalizedClientLink>
            </EmptyContent>
          </Empty>
        )}
      </SheetContent>
    </Sheet>
  )
}

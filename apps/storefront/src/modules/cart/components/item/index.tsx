"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"

import { cn as clx } from "@lib/utils"
import { TableCell, TableRow } from "@modules/common/components/ui/table"
import { Text } from "@/components/typography"
import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import CartItemSelect from "@modules/cart/components/cart-item-select"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

import Thumbnail from "@modules/products/components/thumbnail"
import { useState } from "react"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
}

const Item = ({ item, type = "full", currencyCode }: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setUpdating(true)

    await updateLineItem({
      lineId: item.id,
      quantity,
    })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setUpdating(false)
      })
  }

  // TODO: Update this to grab the actual max inventory
  const maxQtyFromInventory = 10
  const maxQuantity = item.variant?.manage_inventory ? 10 : maxQtyFromInventory

  return (
    <TableRow className="w-full" data-testid="product-row">
      <TableCell
        className={
          type === "preview" ? "w-[68px] py-3 pl-0 pr-3" : "!pl-0 p-4 w-24"
        }
      >
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          aria-label={item.product_title}
          className={clx("flex", {
            "relative w-14 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring":
              type === "preview",
            "small:w-24 w-12": type === "full",
          })}
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            size="square"
            className={type === "preview" ? "rounded-xl" : undefined}
          />
          {type === "preview" && (
            <span
              aria-hidden="true"
              className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-foreground px-1 text-[11px] font-medium tabular-nums text-background"
            >
              {item.quantity}
            </span>
          )}
        </LocalizedClientLink>
      </TableCell>

      <TableCell
        className={clx(
          "text-left",
          type === "preview" && "whitespace-normal break-words px-0"
        )}
      >
        <Text
          className="text-sm font-medium text-foreground"
          data-testid="product-title"
        >
          {item.product_title}
        </Text>
        <LineItemOptions variant={item.variant} data-testid="product-variant" />
        {type === "preview" && (
          <span className="sr-only">수량 {item.quantity}개</span>
        )}
      </TableCell>

      {type === "full" && (
        <TableCell>
          <div className="flex gap-2 items-center w-28">
            <DeleteButton id={item.id} data-testid="product-delete-button" />
            <CartItemSelect
              value={item.quantity}
              maxQuantity={Math.min(maxQuantity, 10)}
              onChange={changeQuantity}
              disabled={updating}
            />
            {updating && <HugeiconsIcon icon={Loading03Icon} />}
          </div>
          <ErrorMessage error={error} data-testid="product-error-message" />
        </TableCell>
      )}

      {type === "full" && (
        <TableCell className="hidden small:table-cell">
          <LineItemUnitPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </TableCell>
      )}

      <TableCell className="!pr-0">
        <span
          className={clx("!pr-0", {
            "flex flex-col items-end pl-2 tabular-nums": type === "preview",
          })}
        >
          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </span>
      </TableCell>
    </TableRow>
  )
}

export default Item

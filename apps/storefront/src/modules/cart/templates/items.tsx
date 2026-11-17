import repeat from "@lib/util/repeat"
import { HttpTypes } from "@medusajs/types"
import { Heading } from "@/components/typography"
import {
  TableHead,
  Table,
  TableBody,
  TableHeader,
  TableRow,
} from "@modules/common/components/ui/table"

import Item from "@modules/cart/components/item"
import SkeletonLineItem from "@modules/skeletons/components/skeleton-line-item"

type ItemsTemplateProps = {
  cart?: HttpTypes.StoreCart
}

const ItemsTemplate = ({ cart }: ItemsTemplateProps) => {
  const items = cart?.items
  return (
    <div>
      <div className="pb-3 flex items-center">
        <Heading className="text-[2rem] leading-[2.75rem]">장바구니</Heading>
      </div>
      <Table>
        <TableHeader className="border-t-0">
          <TableRow className="text-muted-foreground text-sm font-medium">
            <TableHead className="!pl-0">상품</TableHead>
            <TableHead></TableHead>
            <TableHead>수량</TableHead>
            <TableHead className="hidden small:table-cell">금액</TableHead>
            <TableHead className="!pr-0 text-right">합계</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items
            ? items
                .sort((a, b) => {
                  return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
                })
                .map((item) => {
                  return (
                    <Item
                      key={item.id}
                      item={item}
                      currencyCode={cart?.currency_code}
                    />
                  )
                })
            : repeat(5).map((i) => {
                return <SkeletonLineItem key={i} />
              })}
        </TableBody>
      </Table>
    </div>
  )
}

export default ItemsTemplate

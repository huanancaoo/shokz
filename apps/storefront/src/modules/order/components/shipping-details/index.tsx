import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { Heading, Text } from "@/components/typography"

import Divider from "@modules/common/components/divider"

type ShippingDetailsProps = {
  order: HttpTypes.StoreOrder
}

const ShippingDetails = ({ order }: ShippingDetailsProps) => {
  return (
    <div>
      <Heading level="h2" className="flex flex-row text-3xl-regular my-6">
        배송 방법
      </Heading>
      <div className="grid gap-4 [overflow-wrap:anywhere] sm:grid-cols-3 sm:gap-6">
        <div className="min-w-0" data-testid="shipping-address-summary">
          <Text className="text-sm font-medium text-foreground mb-1">
            배송지
          </Text>
          <Text className="text-sm text-muted-foreground">
            {order.shipping_address?.first_name}{" "}
            {order.shipping_address?.last_name}
          </Text>
          <Text className="text-sm text-muted-foreground">
            {order.shipping_address?.address_1}{" "}
            {order.shipping_address?.address_2}
          </Text>
          <Text className="text-sm text-muted-foreground">
            {order.shipping_address?.postal_code},{" "}
            {order.shipping_address?.city}
          </Text>
          <Text className="text-sm text-muted-foreground">
            {order.shipping_address?.country_code?.toUpperCase()}
          </Text>
        </div>

        <div className="min-w-0" data-testid="shipping-contact-summary">
          <Text className="text-sm font-medium text-foreground mb-1">
            연락처
          </Text>
          <Text className="text-sm text-muted-foreground">
            {order.shipping_address?.phone}
          </Text>
          <Text className="text-sm text-muted-foreground">{order.email}</Text>
        </div>

        <div className="min-w-0" data-testid="shipping-method-summary">
          <Text className="text-sm font-medium text-foreground mb-1">
            배송 방법
          </Text>
          <Text className="text-sm text-muted-foreground">
            {(order.shipping_methods?.[0] as { name?: string })?.name} (
            {convertToLocale({
              amount: order.shipping_methods?.[0]?.total ?? 0,
              currency_code: order.currency_code,
            })}
            )
          </Text>
        </div>
      </div>
      <Divider className="mt-8" />
    </div>
  )
}

export default ShippingDetails

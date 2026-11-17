import { HttpTypes } from "@medusajs/types"
import { Text } from "@/components/typography"

type LineItemOptionsProps = {
  variant: HttpTypes.StoreProductVariant | undefined
  "data-testid"?: string
  "data-value"?: HttpTypes.StoreProductVariant
}

const LineItemOptions = ({
  variant,
  "data-testid": dataTestid,
  "data-value": dataValue,
}: LineItemOptionsProps) => {
  return (
    <Text
      data-testid={dataTestid}
      data-value={dataValue}
      className="inline-block text-sm text-muted-foreground w-full overflow-hidden text-ellipsis"
    >
      옵션: {variant?.title}
    </Text>
  )
}

export default LineItemOptions

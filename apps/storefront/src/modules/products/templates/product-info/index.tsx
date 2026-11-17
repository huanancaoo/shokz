import type { HttpTypes } from "@medusajs/types"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DeliveryTruck01Icon,
  Shield02Icon,
  StarIcon,
} from "@hugeicons/core-free-icons"
import { Badge } from "@modules/common/components/ui/badge"
import ProductActions from "@modules/products/components/product-actions"
import { CompareToggle } from "@lib/context/compare-context"
import { productMetadata } from "@lib/util/product"

export default function ProductInfo({
  product,
  region,
}: {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
}) {
  const data = productMetadata(product)
  return (
    <div className="product-detail-info" id="product-info">
      <div className="product-detail-labels">
        <Badge variant="secondary">
          {data?.badge?.join(" / ") || product.categories?.[0]?.name || "SHOKZ"}
        </Badge>
        {data?.comparable && (
          <CompareToggle handle={product.handle!} showLink />
        )}
      </div>
      <h1 data-testid="product-title">{product.title}</h1>
      <p className="product-subtitle">{product.subtitle}</p>
      {data?.rating?.avg && (
        <a href="#reviews" className="product-rating">
          <HugeiconsIcon icon={StarIcon} size={15} />
          {data.rating.avg}
          <span>·</span>
          {data.rating.count?.toLocaleString("ko-KR")}개의 리뷰
        </a>
      )}
      {product.description && (
        <p className="product-description" data-testid="product-description">
          {product.description}
        </p>
      )}
      <div className="product-feature-list">
        {data?.features?.map((feature) => (
          <Badge variant="secondary" key={feature}>
            {feature}
          </Badge>
        ))}
      </div>
      <div className="product-purchase" id="purchase">
        <ProductActions product={product} region={region} />
      </div>
      <div className="purchase-support">
        <span>
          <HugeiconsIcon icon={DeliveryTruck01Icon} size={18} />
          무료 표준 배송
        </span>
        <span>
          <HugeiconsIcon icon={Shield02Icon} size={18} />
          공식 제품 보증 안내
        </span>
      </div>
    </div>
  )
}

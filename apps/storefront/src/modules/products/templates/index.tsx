import type { HttpTypes } from "@medusajs/types"
import { notFound } from "next/navigation"
import ProductInfo from "./product-info"
import VariantImageGallery from "@modules/products/components/image-gallery/variant-image-gallery"
import ProductTabs from "@modules/products/components/product-tabs"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function ProductTemplate({
  product,
  region,
}: {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
}) {
  if (!product?.id) notFound()
  return (
    <>
      <div className="product-detail-top content-container">
        <nav className="product-breadcrumb" aria-label="현재 위치">
          <LocalizedClientLink href="/">홈</LocalizedClientLink>
          <span>/</span>
          <LocalizedClientLink href="/store">전체 제품</LocalizedClientLink>
          <span>/</span>
          <span>{product.title}</span>
        </nav>
        <div className="product-detail-layout">
          <div className="product-gallery">
            <VariantImageGallery product={product} />
          </div>
          <ProductInfo product={product} region={region} />
        </div>
      </div>
      <ProductTabs product={product} />
    </>
  )
}

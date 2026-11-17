"use client"
import { HttpTypes } from "@medusajs/types"
import { useSearchParams } from "next/navigation"
import { variantGallery } from "@lib/util/product"
import { isVariantInStock } from "@lib/util/inventory"
import ImageGallery from "."
export default function VariantImageGallery({
  product,
}: {
  product: HttpTypes.StoreProduct
}) {
  const searchParams = useSearchParams()
  const variant =
    product.variants?.find((item) => item.id === searchParams.get("v_id")) ??
    product.variants?.find(isVariantInStock) ??
    product.variants?.[0]
  const gallery = variantGallery(variant)
  const images = gallery.length
    ? gallery.map((url, index) => ({ id: `${variant?.id}-${index}`, url }))
    : product.images ?? []
  return (
    <ImageGallery
      key={variant?.id}
      images={images}
      video={variant?.metadata?.gallery_video as string | undefined}
    />
  )
}

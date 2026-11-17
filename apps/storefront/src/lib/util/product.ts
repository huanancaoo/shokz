import type { HttpTypes } from "@medusajs/types"

export const isSimpleProduct = (product: HttpTypes.StoreProduct): boolean => {
  return (
    product.options?.length === 1 && product.options[0].values?.length === 1
  )
}

export function getAvailableOptionValues(
  product: HttpTypes.StoreProduct,
  optionId: string,
  selected: Record<string, string | undefined>
) {
  // 仅禁止不存在的 SKU 组合；已售罄的真实 SKU 仍可查看图片和价格。
  return (
    product.variants
      ?.filter((variant) =>
        Object.entries(selected).every(
          ([id, value]) =>
            id === optionId ||
            !value ||
            variant.options?.some(
              (option) => option.option_id === id && option.value === value
            )
        )
      )
      .flatMap(
        (variant) =>
          variant.options
            ?.filter((option) => option.option_id === optionId)
            .map((option) => option.value) ?? []
      ) ?? []
  )
}

export type ProductStoryBlock = {
  id: string
  title: string
  paragraphs: string[]
  media: { src: string; width: number; height: number }[]
  videos: string[]
}

export type ProductMetadata = {
  story?: ProductStoryBlock[]
  badge?: string[]
  rating?: { avg?: number; count?: number }
  features?: string[]
  specifications?: Record<string, string>
  comparison?: Record<string, string>
  comparable?: boolean
  videos?: string[]
  size_guide_video?: string | null
  swatches?: Record<string, string[]>
  faq?: { question: string; answer: string }[]
  detail_images?: string[]
}

export const productMetadata = (product: HttpTypes.StoreProduct) =>
  product.metadata as ProductMetadata | null

export const variantGallery = (variant?: HttpTypes.StoreProductVariant) =>
  (variant?.metadata?.gallery as string[] | undefined) ?? []

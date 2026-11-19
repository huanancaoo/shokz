import { listProducts } from "@lib/data/products"
import ComparePage from "@modules/products/templates/compare"
export const metadata = { title: "제품 비교 | SHOKZ Korea" }
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ products?: string }>
}) {
  const { countryCode } = await params
  const { products: selected = "" } = await searchParams
  const {
    response: { products },
  } = await listProducts({
    countryCode,
    queryParams: { limit: 100, order: "created_at" },
  })
  return (
    <ComparePage
      products={products}
      handles={[...new Set(selected.split(",").filter(Boolean))].slice(0, 3)}
    />
  )
}

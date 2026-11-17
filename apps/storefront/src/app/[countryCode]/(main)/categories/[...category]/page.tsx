import { getCategoryByHandle } from "@lib/data/categories"
import Catalog, { CatalogParams } from "@modules/store/templates"
import { notFound } from "next/navigation"
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ category: string[]; countryCode: string }>
  searchParams: Promise<CatalogParams>
}) {
  const { category, countryCode } = await params
  const entry = await getCategoryByHandle(category)
  if (!entry) notFound()
  return (
    <Catalog
      countryCode={countryCode}
      filters={await searchParams}
      categoryHandle={entry.handle}
    />
  )
}

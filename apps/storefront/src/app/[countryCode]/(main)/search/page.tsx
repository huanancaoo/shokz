import Catalog, { CatalogParams } from "@modules/store/templates"
export const metadata = { title: "제품 컬렉션 | SHOKZ Korea" }
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<CatalogParams>
}) {
  const { countryCode } = await params
  return <Catalog countryCode={countryCode} filters={await searchParams} />
}

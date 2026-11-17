"use server"

import { sdk } from "@lib/config"
import type { HttpTypes } from "@medusajs/types"
import { getAuthHeaders } from "./cookies"
import { listProducts } from "./products"

export async function searchCatalog({
  countryCode,
  q,
  category,
  feature,
  max,
  sort,
  page,
}: {
  countryCode: string
  q?: string
  category?: string
  feature?: string
  max?: string
  sort?: string
  page: number
}) {
  const body: HttpTypes.StoreSearchQuery = {
    entity: "product",
    fields: ["id", "title", "handle"],
    filters: {
      ...(q ? { q } : {}),
      ...(category ? { category } : {}),
      ...(feature ? { labels: feature } : {}),
      ...(max ? { min_price_krw: { $lte: Number(max) } } : {}),
    },
    pagination: {
      take: 12,
      skip: (page - 1) * 12,
      ...(sort === "price_asc" ? { order: { min_price_krw: "ASC" } } : {}),
      ...(sort === "price_desc" ? { order: { min_price_krw: "DESC" } } : {}),
      ...(!q && !sort ? { order: { created_at: "ASC" } } : {}),
    },
    search_options: {
      facets: ["category", "labels"],
      disjunctive_facets: true,
      count: "exact",
    },
  }
  const { results } = await sdk.client.fetch<
    HttpTypes.StoreSearchResponse<{ id: string }>
  >("/store/search", {
    method: "POST",
    body,
    headers: await getAuthHeaders(),
    cache: "no-store",
  })
  const result = results[0]
  const ids = result.hits.map((hit) => hit.id)
  // Search owns ranking and filtering; hydration supplies variant images and regional prices.
  const products = ids.length
    ? (await listProducts({ countryCode, queryParams: { id: ids, limit: 12 } }))
        .response.products
    : []
  const ranked = ids
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is HttpTypes.StoreProduct => Boolean(product))
  const labels = result.facets?.labels
  return {
    products: ranked,
    count: result.metadata.count ?? 0,
    features:
      labels?.type === "value"
        ? labels.values.map((item) => String(item.value))
        : [],
  }
}

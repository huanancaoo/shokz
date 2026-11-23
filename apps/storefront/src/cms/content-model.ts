import type { Page, Post, StorefrontHeader } from "@/payload-types"

export const contentCollections = ["pages", "posts", "banners"] as const
export type ContentCollection = (typeof contentCollections)[number]

export function relationID(value: unknown): number | string | undefined {
  const id =
    typeof value === "object" && value && "id" in value ? value.id : value
  return typeof id === "number" || typeof id === "string" ? id : undefined
}

export function editorialPath(
  collection: "pages" | "posts",
  doc?: Partial<Pick<Page, "breadcrumbs" | "slug">> | null
) {
  if (collection === "pages") return doc?.breadcrumbs?.at(-1)?.url
  return doc?.slug ? `/journal/${doc.slug}` : undefined
}

export function blogCategoryLabels(categories: Post["categories"]) {
  return (categories ?? [])
    .flatMap((category) => typeof category === "object" && category ? [category.title] : [])
    .join(" · ")
}

export function publishedEditorialPath(doc: Page | Post | number | null | undefined) {
  if (typeof doc !== "object" || !doc || doc._status !== "published" || doc.deletedAt) {
    return
  }
  return editorialPath("kind" in doc ? "pages" : "posts", doc)
}

export type EditorialLink = NonNullable<StorefrontHeader["navItems"]>[number]["link"]

export function resolveEditorialLink({ type, reference, url, label, newTab }: EditorialLink) {
  // 下架后的内容仍可以留在编辑配置中，前台入口只链接到发布版本。
  const href = type === "reference" ? publishedEditorialPath(reference?.value) : url
  if (href) return { label, href, newTab: newTab === true }
}

import "server-only"
import config from "@payload-config"
import { cache } from "react"
import { getPayload, type Where } from "payload"
import { redirect, permanentRedirect } from "next/navigation"
import { connection } from "next/server"
import {
  publishedEditorialPath,
  relationID,
  resolveEditorialLink,
  type EditorialLink,
} from "@/cms/content-model"
import { cmsMediaURL } from "@/cms/media-url"
import type { Banner, Page, Post } from "@/payload-types"
import { listProducts } from "./products"

const cms = cache(async () => {
  await connection()
  return getPayload({ config, cron: true })
})

export const getStorefrontTheme = cache(async () => {
  const { activeTheme } = await (await cms()).findGlobal({
    slug: "storefront-appearance",
    depth: 1,
    select: { activeTheme: true },
  })

  if (typeof activeTheme !== "object" || activeTheme === null) {
    throw new Error("Storefront appearance requires an active theme")
  }
  return activeTheme
})

function resolveLayoutLinks(rows?: { id?: string | null; link: EditorialLink }[] | null) {
  return (rows ?? []).flatMap(({ id, link }) => {
    const destination = resolveEditorialLink(link)
    return destination ? [{ id, ...destination }] : []
  })
}

export async function getStorefrontHeader() {
  const { logo, catalog, navItems, mobileSubtitle } =
    await (await cms()).findGlobal({ slug: "storefront-header", depth: 1 })
  const logoURL = cmsMediaURL(logo)
  if (!logoURL) throw new Error("Storefront header requires an uploaded logo")

  return {
    logoURL,
    catalog,
    mobileSubtitle,
    navigation: (navItems ?? []).flatMap(({ id, link, mobileLabel, children }) => {
      const destination = resolveEditorialLink(link)
      return destination
        ? [{
            id,
            ...destination,
            mobileLabel,
            children: resolveLayoutLinks(children),
          }]
        : []
    }),
  }
}

export async function getStorefrontFooter() {
  const { columns, policies, ...settings } = await (await cms()).findGlobal({
    slug: "storefront-footer",
    depth: 1,
  })

  return {
    ...settings,
    columns: (columns ?? []).map(({ navItems, ...column }) => ({
      ...column,
      links: resolveLayoutLinks(navItems),
    })),
    policies: resolveLayoutLinks(policies),
  }
}

// 网站只读取发布版本，草稿由认证后的预览路由读取。
const published: Where = { _status: { equals: "published" } }

export const listCmsCategories = cache(async () => {
  const { docs } = await (await cms()).find({
    collection: "categories",
    sort: ["sortOrder", "title"],
    depth: 0,
    pagination: false,
  })
  return docs
})

export async function listCmsPosts({
  categories,
  ids,
  limit,
}: { categories?: number[]; ids?: number[]; limit?: number } = {}) {
  if (categories?.length === 0 || ids?.length === 0) return []

  const { docs } = await (
    await cms()
  ).find({
    collection: "posts",
    where: {
      ...published,
      ...(categories && { categories: { in: categories } }),
      ...(ids && { id: { in: ids } }),
    },
    sort: ["sortOrder", "-createdAt"],
    select: { slug: true, title: true, categories: true, photos: true },
    depth: 1,
    ...(limit ? { limit } : { pagination: false }),
  })
  return docs
}

export async function searchCmsContent(query: string, page: number) {
  const result = await (await cms()).find({
    collection: "search",
    where: {
      or: ["title", "slug", "meta.title", "meta.description", "text"].map((field) => ({
        [field]: { like: query },
      })),
    },
      sort: ["-priority", "-updatedAt", "-id"],
    depth: 1,
      populate: {
        pages: { title: true, kind: true, breadcrumbs: true, _status: true, deletedAt: true },
        posts: { title: true, slug: true, _status: true, deletedAt: true },
      },
    limit: 12,
    page,
  })

  return {
    hasNextPage: result.hasNextPage,
    hasPrevPage: result.hasPrevPage,
    docs: result.docs.flatMap(({ id, doc, meta, text }) => {
      const href = publishedEditorialPath(doc?.value)
      if (!href || typeof doc?.value !== "object") return []

      return [{
        id,
        href,
        title: doc.value.title,
        type: doc.relationTo,
        description: (meta?.description || text)?.replace(/\s+/g, " ").slice(0, 160),
      }]
    }),
  }
}

export const getCmsPost = cache(async (slug: string) => {
  const {
    docs: [post],
  } = await (
    await cms()
  ).find({
    collection: "posts",
    where: { ...published, slug: { equals: slug } },
    depth: 2,
    limit: 1,
  })
  return post
})

export const getCmsPage = cache(async (path: string) => {
  const {
    docs: [page],
  } = await (
    await cms()
  ).find({
    collection: "pages",
    where: {
      ...published,
      slug: { equals: path.split("/").pop() },
      "breadcrumbs.url": { equals: path },
    },
    depth: 2,
    limit: 1,
  })
  return page
})

export async function listCmsSitemapEntries() {
  const payload = await cms()
  const [posts, pages] = await Promise.all([
    payload.find({
      collection: "posts",
      where: published,
      depth: 0,
      pagination: false,
      select: { slug: true, updatedAt: true },
    }),
    payload.find({
      collection: "pages",
      where: published,
      depth: 0,
      pagination: false,
      select: { breadcrumbs: true, updatedAt: true },
    }),
  ])

  return [
    ...posts.docs.map(({ slug, updatedAt }) => ({
      path: `/journal/${slug}`,
      updatedAt,
    })),
    ...pages.docs.flatMap(({ breadcrumbs, updatedAt }) => {
      const path = breadcrumbs?.at(-1)?.url
      return path ? [{ path, updatedAt }] : []
    }),
  ]
}

export const getCmsRedirect = cache(async (path: string) => {
  const {
    docs: [entry],
  } = await (
    await cms()
  ).find({
    collection: "redirects",
    where: { from: { equals: path } },
    depth: 1,
    limit: 1,
  })
  if (!entry?.to) return

  const ref = entry.to.reference
  let destination: string | null | undefined
  if (entry.to.type === "custom") destination = entry.to.url
  else destination = publishedEditorialPath(ref?.value)

  if (!destination || destination === path) return
  return { destination, permanent: entry.type === "308" }
})

export async function applyCmsRedirect(path: string, countryCode: string) {
  const entry = await getCmsRedirect(path)
  if (!entry) return
  const { destination, permanent } = entry
  const internal = /^\/(?![/\\])[^\s\\]*$/.test(destination)
  if (!internal && !/^https?:\/\//i.test(destination)) return
  const href = internal ? `/${countryCode}${destination}` : destination
  if (permanent) permanentRedirect(href)
  redirect(href)
}

export async function listReferencedProducts(
  countryCode: string,
  ids: string[]
) {
  if (!ids.length) return []
  const {
    response: { products },
  } = await listProducts({
    countryCode,
    queryParams: { id: ids, limit: ids.length },
  })
  const byID = new Map(products.map((product) => [product.id, product]))
  return ids.flatMap((id) => {
    const product = byID.get(id)
    return product ? [product] : []
  })
}

export async function listCmsBanners() {
  const { docs } = await (
    await cms()
  ).find({
    collection: "banners",
    where: published,
    depth: 1,
    pagination: false,
    sort: ["sortOrder", "id"],
  })
  return docs
}

export function cmsBannerLink(
  banner: Banner,
  handles: ReadonlyMap<string, string>
) {
  if (banner.linkType === "page") return banner.href ?? undefined
  const id = relationID(banner.product)
  const handle = typeof id === "string" ? handles.get(id) : undefined
  return handle ? `/products/${handle}` : undefined
}

export function editorialMetadata(
  content?: Page | Post,
  defaultTitle = "SHOKZ Korea"
) {
  const image = cmsMediaURL(content?.meta?.image)
  return {
    title:
      content?.meta?.title ||
      (content?.title ? `${content.title} | SHOKZ Korea` : defaultTitle),
    description: content?.meta?.description,
    ...(image && { openGraph: { images: [image] } }),
  }
}

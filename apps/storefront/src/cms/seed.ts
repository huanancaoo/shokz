import { access } from "node:fs/promises"
import path from "node:path"
import { getPayload } from "payload"
import config from "../payload.config"
import articles from "../content/articles.json"
import home from "../content/home.json"
import pages from "../content/pages.json"
import type { Page, Post } from "../payload-types"

function sourceFile(url: string) {
  if (url.startsWith("/media/")) return path.join(process.cwd(), "public", url)
  return path.resolve(
    "../backend/static",
    decodeURIComponent(path.basename(new URL(url).pathname))
  )
}

function paragraphsToLexical(paragraphs: string[]): Post["body"] {
  return {
    root: {
      type: "root",
      version: 1,
      direction: null,
      format: "",
      indent: 0,
      children: paragraphs.map((text) => ({
        type: "paragraph",
        version: 1,
        direction: null,
        format: "",
        indent: 0,
        children: [
          {
            type: "text",
            text,
            version: 1,
            detail: 0,
            format: 0,
            mode: "normal",
            style: "",
          },
        ],
      })),
    },
  }
}

const payload = await getPayload({ config, cron: false })

try {
  const mediaIDs = new Map<string, number>()
  async function importMedia(url: string) {
    const filePath = sourceFile(url)
    const previous = mediaIDs.get(filePath)
    if (previous) return previous

    const {
      docs: [existing],
    } = await payload.find({
      collection: "media",
      where: {
        filename: { equals: path.basename(filePath) },
      },
      depth: 0,
      limit: 1,
    })
    const id =
      existing?.id ??
      (
        await payload.create({
          collection: "media",
          data: {},
          filePath,
          depth: 0,
        })
      ).id
    mediaIDs.set(filePath, id)
    return id
  }

  async function exists(
    collection: "posts" | "pages" | "banners",
    slug: string
  ) {
    // 草稿和回收站也保留该 slug，重复导入时应保留运营的变更。
    const { totalDocs } = await payload.count({
      collection,
      where: { slug: { equals: slug } },
      trash: true,
    })
    return totalDocs > 0
  }

  async function importPhotos(urls: string[]) {
    const photos = []
    for (const url of urls) photos.push(await importMedia(url))
    return photos
  }

  const mediaSources = [
    ...pages.flatMap(({ images }) => images),
    ...articles.flatMap(({ images }) => images),
    ...home.campaigns.flatMap(({ desktop, mobile, poster }) =>
      desktop.video
        ? [poster, desktop.video, mobile.video]
        : [desktop.image, mobile.image]
    ),
  ]
  for (const url of new Set(mediaSources)) {
    if (url) await access(sourceFile(url))
  }

  let imported = 0
  for (const page of pages) {
    if (await exists("pages", page.slug)) continue
    await payload.create({
      collection: "pages",
      data: {
        slug: page.slug,
        title: page.title,
        kind: page.kind as Page["kind"],
        body: paragraphsToLexical(page.paragraphs),
        photos: await importPhotos(page.images),
        _status: "published",
      },
    })
    imported++
  }

  for (const [index, article] of articles.entries()) {
    if (await exists("posts", article.slug)) continue
    await payload.create({
      collection: "posts",
      data: {
        slug: article.slug,
        title: article.title,
        category: article.category as Post["category"],
        body: paragraphsToLexical(article.paragraphs),
        photos: await importPhotos(article.images),
        sortOrder: index,
        _status: "published",
      },
    })
    imported++
  }

  for (const [index, campaign] of home.campaigns.entries()) {
    const slug = campaign.english_name.toLowerCase().replaceAll(" ", "-")
    if (await exists("banners", slug)) continue
    const common = {
      slug,
      title: campaign.title,
      caption: campaign.english_name,
      sortOrder: index,
      linkType: "page" as const,
      href: campaign.href,
      _status: "published" as const,
    }
    const assets =
      campaign.desktop.video && campaign.mobile.video
        ? {
            format: "video" as const,
            desktopImage: await importMedia(campaign.poster),
            desktopVideo: await importMedia(campaign.desktop.video),
            mobileVideo: await importMedia(campaign.mobile.video),
            eyebrow: "OPEN YOUR WORLD",
            headline: "나의 모든 순간에,\n샥즈.",
            actionLabel: "샥즈 스쿼드 만나보기",
          }
        : {
            format: "image" as const,
            desktopImage: await importMedia(campaign.desktop.image!),
            mobileImage: await importMedia(campaign.mobile.image!),
          }
    await payload.create({
      collection: "banners",
      data: { ...common, ...assets },
    })
    imported++
  }
  payload.logger.info(`Imported ${imported} Shokz content documents`)
} finally {
  await payload.destroy()
}

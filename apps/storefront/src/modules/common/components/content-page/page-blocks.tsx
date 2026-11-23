import Link from "next/link"
import { relationID, resolveEditorialLink, type EditorialLink } from "@/cms/content-model"
import { cmsMediaURL } from "@/cms/media-url"
import { listCmsPosts } from "@lib/data/cms"
import type { Media, Page, PageArchiveBlock, PageMediaBlock } from "@/payload-types"
import CmsRichText from "@modules/common/components/cms-rich-text"
import JournalCard from "@modules/common/components/journal-card"
import Image from "@modules/common/components/store-image"
import { buttonVariants } from "@modules/common/components/ui/button"
import ContentForm from "./content-form"

const columnWidths = {
  full: "md:col-span-12",
  half: "md:col-span-6",
  oneThird: "md:col-span-4",
  twoThirds: "md:col-span-8",
}

function ActionLinks({
  links,
  countryCode,
}: {
  links?: { id?: string | null; link: EditorialLink }[] | null
  countryCode: string
}) {
  const actions = links?.flatMap(({ id, link }) => {
    const action = resolveEditorialLink(link)
    return action ? [{ ...action, id }] : []
  })
  if (!actions?.length) return null

  return (
    <div className="mt-5 flex flex-wrap gap-3">
      {actions.map(({ id, href, label, newTab }, index) => (
        <Link
          key={id ?? href}
          href={href.startsWith("/") ? `/${countryCode}${href}` : href}
          target={newTab ? "_blank" : undefined}
          rel={newTab ? "noopener noreferrer" : undefined}
          className={buttonVariants({ variant: index ? "outline" : "default" })}
        >
          {label}
        </Link>
      ))}
    </div>
  )
}

export function PageHero({ page, countryCode }: { page: Page; countryCode: string }) {
  const { hero, title } = page
  if (hero?.type === "none") {
    return <header className="content-container py-8"><h1 className="text-3xl font-semibold">{title}</h1></header>
  }

  const image = cmsMediaURL(hero?.media)
  const high = hero?.type === "highImpact" && Boolean(image)
  const medium = hero?.type === "mediumImpact" && Boolean(image)

  return (
    <header className={high ? "relative isolate grid min-h-[420px] items-end bg-black py-12 text-white" : "editorial-hero"}>
      {high && image && (
        <>
          <Image src={image} alt="" fill sizes="100vw" className="-z-20 object-cover" priority />
          <div className="absolute inset-0 -z-10 bg-black/60" aria-hidden="true" />
        </>
      )}
      <div className={medium ? "content-container grid items-center gap-8 md:grid-cols-2" : "content-container"}>
        <div>
          <p className="eyebrow">SHOKZ · OPEN YOUR WORLD</p>
          <h1 className={high ? "text-4xl font-semibold md:text-5xl" : undefined}>{title}</h1>
          {hero?.richText && (
            <div className="editorial-paragraphs mt-4">
              <CmsRichText data={hero.richText} countryCode={countryCode} />
            </div>
          )}
          <ActionLinks links={hero?.links} countryCode={countryCode} />
        </div>
        {medium && image && (
          <Image src={image} alt={title} width={1200} height={700} className="h-auto w-full rounded-lg" priority />
        )}
      </div>
    </header>
  )
}

function MediaBlock({ block, title }: { block: PageMediaBlock; title: string }) {
  const gallery = block.display === "gallery"
  const media = (block.media ?? []).filter((item): item is Media => typeof item === "object" && Boolean(item))

  return (
    <figure>
      <div className={gallery ? "editorial-gallery" : "grid gap-4"}>
        {media.map((item, index) => {
          const src = cmsMediaURL(item)
          if (!src) return null
          const key = `${item.id}-${index}`
          if (item.mimeType?.startsWith("video/")) {
            return <video key={key} className="h-auto w-full rounded-lg" controls src={src} />
          }
          if (!item.mimeType?.startsWith("image/")) {
            return <Link key={key} className="text-link" href={src}>{item.alt || item.filename}</Link>
          }
          return (
            <Image
              key={key}
              className={!gallery ? "editorial-main-image" : undefined}
              src={src}
              alt={item.alt || title}
              width={gallery ? 800 : 1200}
              height={gallery ? 650 : 700}
              priority={!gallery && index === 0}
            />
          )
        })}
      </div>
      {block.caption && <figcaption className="mt-2 text-sm text-muted-foreground">{block.caption}</figcaption>}
    </figure>
  )
}

async function ArchiveBlock({ block, countryCode }: { block: PageArchiveBlock; countryCode: string }) {
  const ids = (block.selectedDocs ?? []).map(relationID).filter((id): id is number => typeof id === "number")
  const categories = (block.categories ?? []).map(relationID).filter((id): id is number => typeof id === "number")
  const articles = await listCmsPosts(block.populateBy === "selection"
    ? { ids }
    : { categories: categories.length ? categories : undefined, limit: block.limit ?? 6 })
  const byID = new Map(articles.map((article) => [article.id, article]))
  const ordered = block.populateBy === "selection" ? ids.map((id) => byID.get(id)) : articles

  return (
    <section className="my-10">
      {block.introContent && <CmsRichText data={block.introContent} countryCode={countryCode} />}
      <div className="journal-grid mt-5">
        {ordered.map((article) => article && (
          <JournalCard key={article.id} article={article} countryCode={countryCode} />
        ))}
      </div>
    </section>
  )
}

export default function PageBlocks({
  page,
  countryCode,
  preview,
}: {
  page: Page
  countryCode: string
  preview: boolean
}) {
  return (page.layout ?? []).map((block, index) => {
    const key = block.id ?? index

    switch (block.blockType) {
      case "content":
        return (
          <div key={key} className="editorial-paragraphs grid gap-6 md:grid-cols-12">
            {block.columns.map((column, columnIndex) => (
              <div key={column.id ?? columnIndex} className={columnWidths[column.size]}>
                {column.richText && <CmsRichText data={column.richText} countryCode={countryCode} />}
                {column.enableLink && column.link && (
                  <ActionLinks links={[{ link: column.link }]} countryCode={countryCode} />
                )}
              </div>
            ))}
          </div>
        )
      case "mediaBlock":
        return <MediaBlock key={key} block={block} title={page.title} />
      case "cta":
        return (
          <section key={key} className="my-8 rounded-lg border border-border bg-card p-6 sm:p-8">
            {block.richText && <CmsRichText data={block.richText} countryCode={countryCode} />}
            <ActionLinks links={block.links} countryCode={countryCode} />
          </section>
        )
      case "archive":
        return <ArchiveBlock key={key} block={block} countryCode={countryCode} />
      case "formBlock":
        if (typeof block.form !== "object" || !block.form) return null
        return (
          <section key={key} className="my-8 max-w-2xl">
            {block.introContent && <CmsRichText data={block.introContent} countryCode={countryCode} />}
            <ContentForm
              countryCode={countryCode}
              endpoint={`/${countryCode}/content-forms/${page.id}/${block.form.id}`}
              fields={block.form.fields}
              submitLabel={block.form.submitButtonLabel}
              confirmation={block.form.confirmationMessage}
              preview={preview}
            />
          </section>
        )
    }
  })
}

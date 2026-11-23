import { listCmsCategories, listCmsPosts } from "@lib/data/cms"
import { relationID } from "@/cms/content-model"
import JournalCard from "@modules/common/components/journal-card"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export const metadata = { title: "샥즈 소식 & 이벤트 | SHOKZ Korea" }

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ countryCode: string }>
  searchParams: Promise<{ category?: string }>
}) {
  const [{ countryCode }, { category }, categories] = await Promise.all([
    params,
    searchParams,
    listCmsCategories(),
  ])
  const selected = categories.find(({ slug }) => slug === category)
  const categoryIDs = category
    ? categories.filter((item) => selected && (
        item.id === selected.id ||
        item.breadcrumbs?.some(({ doc }) => relationID(doc) === selected.id)
      )).map(({ id }) => id)
    : undefined
  const entries = await listCmsPosts({ categories: categoryIDs })

  return (
    <div className="journal-page content-container">
      <p className="eyebrow">STORIES THAT MOVE US</p>
      <h1>샥즈의 새로운 이야기.</h1>
      <LocalizedClientLink href="/content-search" className="text-link">
        콘텐츠 검색
      </LocalizedClientLink>
      <div className="category-pills">
        <LocalizedClientLink
          href="/journal"
          className={!category ? "active" : ""}
        >
          전체 소식
        </LocalizedClientLink>
        {categories.filter(({ visibleInJournal }) => visibleInJournal).map(({ id, slug, title }) => (
          <LocalizedClientLink
            key={id}
            href={`/journal?category=${encodeURIComponent(slug)}`}
            className={category === slug ? "active" : ""}
          >
            {title}
          </LocalizedClientLink>
        ))}
      </div>
      <div className="journal-grid">
        {entries.map((article) => (
          <JournalCard key={article.slug} article={article} countryCode={countryCode} />
        ))}
        {entries.length === 0 && <p className="text-muted-foreground">게시된 소식이 없습니다.</p>}
      </div>
    </div>
  )
}

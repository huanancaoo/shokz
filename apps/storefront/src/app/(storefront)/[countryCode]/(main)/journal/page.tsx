import { listCmsPosts } from "@lib/data/cms"
import { cmsMediaURL } from "@/cms/media-url"
import Image from "@modules/common/components/store-image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
export const metadata = { title: "샥즈 소식 & 이벤트 | SHOKZ Korea" }
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const { category } = await searchParams
  const entries = await listCmsPosts({ category })
  return (
    <div className="journal-page content-container">
      <p className="eyebrow">STORIES THAT MOVE US</p>
      <h1>샥즈의 새로운 이야기.</h1>
      <div className="category-pills">
        <LocalizedClientLink
          href="/journal"
          className={!category ? "active" : ""}
        >
          전체 소식
        </LocalizedClientLink>
        {[
          ["news", "브랜드 뉴스"],
          ["guide", "오픈이어 가이드"],
          ["event", "이벤트"],
          ["notify", "공지사항"],
        ].map(([key, name]) => (
          <LocalizedClientLink
            key={key}
            href={`/journal?category=${key}`}
            className={category === key ? "active" : ""}
          >
            {name}
          </LocalizedClientLink>
        ))}
      </div>
      <div className="journal-grid">
        {entries.map((article) => {
          const photo = cmsMediaURL(article.photos?.[0])
          return (
            <LocalizedClientLink
              href={`/journal/${article.slug}`}
              key={article.slug}
              className="journal-card"
            >
              {photo && (
                <div className="journal-image">
                  <Image
                    src={photo}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 90vw, 33vw"
                    loading="lazy"
                  />
                </div>
              )}
              <span>{article.category.toUpperCase()}</span>
              <h3>{article.title}</h3>
              <p className="text-link">
                이야기 읽기 <HugeiconsIcon icon={ArrowRight01Icon} />
              </p>
            </LocalizedClientLink>
          )
        })}
      </div>
    </div>
  )
}

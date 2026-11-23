import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { blogCategoryLabels } from "@/cms/content-model"
import { cmsMediaURL } from "@/cms/media-url"
import type { Post } from "@/payload-types"
import Image from "@modules/common/components/store-image"
import Link from "next/link"

export default function JournalCard({
  article,
  countryCode,
}: {
  article: Pick<Post, "slug" | "title" | "photos" | "categories">
  countryCode: string
}) {
  const image = cmsMediaURL(article.photos?.[0])
  const categories = blogCategoryLabels(article.categories)

  return (
    <Link href={`/${countryCode}/journal/${article.slug}`} className="journal-card">
      {image && (
        <div className="journal-image">
          <Image src={image} alt={article.title} fill sizes="(max-width: 768px) 90vw, 33vw" />
        </div>
      )}
      {categories && <span>{categories}</span>}
      <h3>{article.title}</h3>
      <p className="text-link">
        이야기 읽기 <HugeiconsIcon icon={ArrowRight01Icon} />
      </p>
    </Link>
  )
}

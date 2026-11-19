import { notFound } from "next/navigation"
import { applyCmsRedirect, editorialMetadata, getCmsPost } from "@lib/data/cms"
import Editorial from "@modules/common/components/content-page"

type Props = { params: Promise<{ countryCode: string; slug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  return editorialMetadata(await getCmsPost(slug), "샥즈 소식 | SHOKZ Korea")
}

export default async function Page({ params }: Props) {
  const { countryCode, slug } = await params
  await applyCmsRedirect(`/journal/${slug}`, countryCode)
  const page = await getCmsPost(slug)
  if (!page) notFound()
  return <Editorial page={page} countryCode={countryCode} />
}

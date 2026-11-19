import { notFound } from "next/navigation"
import { applyCmsRedirect, editorialMetadata, getCmsPage } from "@lib/data/cms"
import Editorial from "@modules/common/components/content-page"

type Props = { params: Promise<{ countryCode: string; slug: string[] }> }

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  return editorialMetadata(
    await getCmsPage(`/pages/${slug.join("/")}`),
    "페이지 | SHOKZ Korea"
  )
}

export default async function Page({ params }: Props) {
  const { countryCode, slug } = await params
  const path = `/pages/${slug.join("/")}`
  await applyCmsRedirect(path, countryCode)
  const page = await getCmsPage(path)
  if (!page) notFound()
  return <Editorial page={page} countryCode={countryCode} />
}

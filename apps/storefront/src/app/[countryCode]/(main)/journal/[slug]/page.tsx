import { notFound } from "next/navigation"
import articles from "../../../../../content/articles.json"
import Editorial from "@modules/common/components/content-page"
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return {
    title: `${
      articles.find((article) => article.slug === slug)?.title ?? "샥즈 소식"
    } | SHOKZ Korea`,
  }
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const page = articles.find((article) => article.slug === slug)
  if (!page) notFound()
  return <Editorial page={page} />
}

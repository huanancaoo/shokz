import { notFound } from "next/navigation"
import pages from "../../../../../content/pages.json"
import Editorial from "@modules/common/components/content-page"
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const page = pages.find((page) => page.slug === slug)
  return { title: `${page?.title ?? "페이지"} | SHOKZ Korea` }
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const page = pages.find((page) => page.slug === slug)
  if (!page) notFound()
  return <Editorial page={page} />
}

import config from "@payload-config"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { getPayload } from "payload"
import { contentCollections, type ContentCollection } from "@/cms/content-model"
import Editorial from "@modules/common/components/content-page"
import Preview from "./preview"
import PreviewRefresh from "./preview-refresh"

export const metadata = { robots: { index: false, follow: false } }

type Props = {
  params: Promise<{ collection: string; countryCode: string; id: string }>
  searchParams: Promise<{ locale?: string }>
}

export default async function PreviewPage({ params, searchParams }: Props) {
  const { collection, countryCode, id } = await params
  const { locale } = await searchParams
  const documentID = Number(id)
  if (
    !contentCollections.includes(collection as ContentCollection) ||
    !Number.isSafeInteger(documentID)
  ) {
    notFound()
  }

  const payload = await getPayload({ config, cron: true })
  const { user } = await payload.auth({ headers: await headers() })
  if (user?.collection !== "users") notFound()

  const content = await payload.findByID({
    collection: collection as ContentCollection,
    id: documentID,
    locale: locale === "en" || locale === "zh" ? locale : "ko",
    draft: true,
    depth: 2,
    user,
    overrideAccess: false,
    disableErrors: true,
  })
  if (!content) notFound()
  if ("kind" in content) {
    return (
      <>
        <PreviewRefresh serverURL={payload.config.serverURL} />
        <Editorial page={content} countryCode={countryCode} preview />
      </>
    )
  }
  return <Preview content={content} countryCode={countryCode} serverURL={payload.config.serverURL} />
}

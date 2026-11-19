import config from "@payload-config"
import { headers } from "next/headers"
import { notFound } from "next/navigation"
import { getPayload } from "payload"
import { contentCollections, type ContentCollection } from "@/cms/content-model"
import Preview from "./preview"

type Props = {
  params: Promise<{ collection: string; id: string }>
  searchParams: Promise<{ locale?: string }>
}

export default async function PreviewPage({ params, searchParams }: Props) {
  const { collection, id } = await params
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
  return <Preview content={content} serverURL={payload.config.serverURL} />
}

"use client"

import { useLivePreview } from "@payloadcms/live-preview-react"
import Image from "next/image"
import type { Banner, Page, Post } from "@/payload-types"
import { cmsMediaURL } from "@/cms/media-url"
import CmsRichText from "@modules/common/components/cms-rich-text"

export default function Preview({
  content,
  serverURL,
}: {
  content: Page | Post | Banner
  serverURL: string
}) {
  const { data } = useLivePreview({ initialData: content, depth: 2, serverURL })
  const image = cmsMediaURL(
    "desktopImage" in data ? data.desktopImage : data.photos?.[0]
  )
  const video =
    "desktopVideo" in data ? cmsMediaURL(data.desktopVideo) : undefined
  return (
    <article
      style={{ width: "min(100%, 800px)", margin: "auto", padding: "2rem" }}
    >
      <h1>{data.title}</h1>
      {video ? (
        <video controls src={video} poster={image} style={{ width: "100%" }} />
      ) : (
        image && (
          <Image
            src={image}
            width={800}
            height={500}
            alt={data.title}
            unoptimized
            style={{ width: "100%", height: "auto" }}
          />
        )
      )}
      {"body" in data && <CmsRichText data={data.body} countryCode="kr" />}
      {"headline" in data && <p>{data.headline}</p>}
    </article>
  )
}

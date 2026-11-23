"use client"

import { RefreshRouteOnSave } from "@payloadcms/live-preview-react"
import { useRouter } from "next/navigation"

export default function PreviewRefresh({ serverURL }: { serverURL: string }) {
  const router = useRouter()
  const origin = typeof window === "undefined" ? serverURL : window.location.origin
  return <RefreshRouteOnSave refresh={router.refresh} serverURL={origin} />
}

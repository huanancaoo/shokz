"use client"

import { useRowLabel } from "@payloadcms/ui"

export function LayoutRowLabel() {
  const { data } = useRowLabel<{ label?: string; link?: { label?: string } }>()
  return data?.link?.label || data?.label || "未命名"
}

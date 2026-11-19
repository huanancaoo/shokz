import type { Media } from "@/payload-types"

export function cmsMediaURL(media?: Media | number | null) {
  return typeof media === "object" && media?.filename
    ? `/api/media/file/${encodeURIComponent(media.filename)}`
    : undefined
}

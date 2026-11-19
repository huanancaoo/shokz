export const contentCollections = ["pages", "posts", "banners"] as const
export type ContentCollection = (typeof contentCollections)[number]

export const postCategories = {
  news: "브랜드 뉴스",
  guide: "오픈이어 가이드",
  event: "이벤트",
  notify: "공지사항",
  magazine: "매거진",
  interview: "인터뷰",
} as const

export function relationID(value: unknown): number | string | undefined {
  const id =
    typeof value === "object" && value && "id" in value ? value.id : value
  return typeof id === "number" || typeof id === "string" ? id : undefined
}

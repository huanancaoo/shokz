import { relationID } from "./content-model"

export function cmsPreviewPath(collection: string, id: unknown, locale: string) {
  const documentID = relationID(id)
  if (documentID === undefined) return null

  // 预览与管理页同源，使用当前登录会话读取草稿。
  const query = new URLSearchParams({ locale })
  const country = (process.env.NEXT_PUBLIC_DEFAULT_REGION || "kr").toLowerCase()
  return `/${country}/cms-preview/${encodeURIComponent(collection)}/${encodeURIComponent(documentID)}?${query}`
}

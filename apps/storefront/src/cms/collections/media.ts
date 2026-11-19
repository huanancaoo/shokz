import path from "node:path"
import type { CollectionConfig } from "payload"
import { adminAccess, staffAccess } from "../access"

const storage = path.join(process.cwd(), "data", "payload")

export const Media: CollectionConfig = {
  slug: "media",
  admin: { group: "内容", useAsTitle: "filename" },
  // 网站素材通过 Payload 文件路由直接显示，表单附件存入单独的权限集合。
  access: { ...staffAccess, read: () => true },
  upload: {
    staticDir: path.join(storage, "media"),
    mimeTypes: ["image/*", "video/mp4", "application/pdf"],
    imageSizes: [{ name: "thumb", width: 480, withoutEnlargement: true }],
    adminThumbnail: "thumb",
  },
  fields: [{ name: "alt", type: "text", localized: true }],
}

export const FormUploads: CollectionConfig = {
  slug: "form-uploads",
  admin: { group: "表单" },
  access: adminAccess,
  upload: {
    staticDir: path.join(storage, "form-uploads"),
    mimeTypes: ["image/*", "application/pdf"],
  },
  fields: [],
}

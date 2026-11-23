import path from "node:path"
import { APIError, type CollectionConfig } from "payload"
import { adminAccess, staffAccess } from "../access"

const storage = path.join(process.cwd(), "data", "payload")

export const Media: CollectionConfig = {
  slug: "media",
  folders: true,
  admin: { group: "内容", useAsTitle: "filename" },
  // 网站素材通过 Payload 文件路由直接显示，表单附件存入单独的权限集合。
  access: { ...staffAccess, read: () => true },
  hooks: {
    beforeDelete: [
      async ({ id, req }) => {
        const { logo } = await req.payload.findGlobal({
          slug: "storefront-header",
          depth: 0,
          select: { logo: true },
          req,
        })
        // Payload 会先清理上传文件，再删除数据库记录，必须在文件清理前拦截。
        if (String(logo) === String(id)) {
          throw new APIError("请先在「网站布局 → 页眉」更换正在使用的 Logo。", 409)
        }
      },
    ],
  },
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

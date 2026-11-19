import type { CollectionConfig } from "payload"
import { isCatalogSync, isStaff } from "../access"

export const MedusaProducts: CollectionConfig = {
  slug: "medusa-products",
  labels: { singular: "商品", plural: "商品" },
  admin: {
    group: "内容",
    useAsTitle: "title",
    defaultColumns: ["title", "handle", "id"],
  },
  access: {
    read: (args) => isStaff(args) || isCatalogSync(args),
    create: isCatalogSync,
    update: isCatalogSync,
    delete: isCatalogSync,
  },
  fields: [
    { name: "id", type: "text", required: true },
    { name: "title", type: "text", required: true },
    { name: "handle", type: "text", required: true },
    { name: "thumbnail", type: "text" },
  ],
}

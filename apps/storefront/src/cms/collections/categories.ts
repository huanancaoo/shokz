import { slugField, type CollectionConfig } from "payload"
import { staffAccess } from "../access"

export const Categories: CollectionConfig = {
  slug: "categories",
  labels: { singular: "博客分类", plural: "博客分类" },
  access: staffAccess,
  admin: {
    group: "内容",
    useAsTitle: "title",
    defaultColumns: ["title", "slug", "visibleInJournal", "sortOrder"],
  },
  fields: [
    { name: "title", label: "分类名称", type: "text", localized: true, required: true },
    slugField({ position: undefined }),
    { name: "visibleInJournal", label: "在博客导航显示", type: "checkbox", defaultValue: true },
    { name: "sortOrder", label: "排序", type: "number", defaultValue: 0, required: true },
  ],
}

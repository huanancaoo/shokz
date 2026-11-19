import type { CollectionConfig, Field } from "payload"
import { staffAccess } from "../access"
import { postCategories } from "../content-model"

const versions = { drafts: { autosave: true, schedulePublish: true } }

function identity(): Field[] {
  return [
    { name: "title", type: "text", required: true, localized: true },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      validate: (value: unknown) =>
        (typeof value === "string" && /^[a-zA-Z0-9_-]+$/.test(value)) ||
        "请填写由字母、数字、下划线或连字符组成的路径段",
    },
  ]
}

function articleFields(): Field[] {
  return [
    ...identity(),
    { name: "body", type: "richText", required: true, localized: true },
    { name: "photos", type: "upload", relationTo: "media", hasMany: true },
    {
      name: "products",
      type: "relationship",
      relationTo: "medusa-products",
      hasMany: true,
      label: "关联商品",
    },
  ]
}

export const Pages: CollectionConfig = {
  slug: "pages",
  labels: { singular: "页面", plural: "页面" },
  admin: { group: "内容", useAsTitle: "title" },
  access: staffAccess,
  versions,
  trash: true,
  fields: [
    ...articleFields(),
    {
      name: "kind",
      type: "select",
      defaultValue: "editorial",
      required: true,
      options: ["editorial", "display", "membership"],
    },
  ],
}

export const Posts: CollectionConfig = {
  slug: "posts",
  labels: { singular: "博客", plural: "博客" },
  admin: { group: "内容", useAsTitle: "title" },
  access: staffAccess,
  versions,
  trash: true,
  fields: [
    ...articleFields(),
    {
      name: "category",
      type: "select",
      required: true,
      options: Object.entries(postCategories).map(([value, label]) => ({
        value,
        label,
      })),
    },
    { name: "sortOrder", type: "number", required: true, defaultValue: 0 },
  ],
}

export const Banners: CollectionConfig = {
  slug: "banners",
  labels: { singular: "Banner", plural: "Banner" },
  admin: { group: "内容", useAsTitle: "title" },
  access: staffAccess,
  versions,
  trash: true,
  fields: [
    ...identity(),
    { name: "caption", type: "text", localized: true, required: true },
    { name: "sortOrder", type: "number", required: true, defaultValue: 0 },
    {
      name: "format",
      type: "select",
      required: true,
      defaultValue: "image",
      options: ["image", "video"],
    },
    {
      name: "desktopImage",
      type: "upload",
      relationTo: "media",
      required: true,
    },
    {
      name: "mobileImage",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: { condition: (data) => data.format === "image" },
    },
    ...(["desktopVideo", "mobileVideo"] as const).map((name): Field => ({
      name,
      type: "upload",
      relationTo: "media",
      required: true,
      filterOptions: { mimeType: { equals: "video/mp4" } },
      admin: { condition: (data) => data.format === "video" },
    })),
    ...(["eyebrow", "headline", "actionLabel"] as const).map((name): Field => ({
      name,
      type: "text",
      localized: true,
      admin: { condition: (data) => data.format === "video" },
    })),
    {
      name: "linkType",
      type: "select",
      required: true,
      defaultValue: "page",
      options: ["page", "product"],
    },
    {
      name: "href",
      type: "text",
      required: true,
      admin: { condition: (data) => data.linkType === "page" },
      validate: (value: unknown) =>
        (typeof value === "string" && /^\/(?![/\\])[^\s\\]*$/.test(value)) ||
        "请填写站内路径",
    },
    {
      name: "product",
      type: "relationship",
      relationTo: "medusa-products",
      admin: { condition: (data) => data.linkType === "product" },
      required: true,
    },
  ],
}

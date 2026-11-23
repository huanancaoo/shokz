import type { Block, Field } from "payload"
import { editorialText } from "./editorial-text"
import { websiteLink } from "./website-link"

const richText = (name = "richText", label = "正文"): Field => ({
  name,
  label,
  type: "richText",
  editor: editorialText,
  localized: true,
})

const links = (): Field => ({
  name: "links",
  label: "操作链接",
  type: "array",
  maxRows: 2,
  fields: [websiteLink()],
})

export const pageHero: Field = {
  name: "hero",
  type: "group",
  label: false,
  fields: [
    {
      name: "type",
      label: "头图样式",
      type: "select",
      defaultValue: "lowImpact",
      required: true,
      options: [
        { label: "仅页面标题", value: "none" },
        { label: "标准标题区", value: "lowImpact" },
        { label: "标题和图片", value: "mediumImpact" },
        { label: "通栏背景图", value: "highImpact" },
      ],
    },
    richText("richText", "导语"),
    links(),
    {
      name: "media",
      label: "头图",
      type: "upload",
      relationTo: "media",
      required: true,
      filterOptions: { mimeType: { like: "image/" } },
      admin: {
        condition: (_, { type }) => type === "mediumImpact" || type === "highImpact",
      },
    },
  ],
}

const content: Block = {
  slug: "content",
  interfaceName: "PageContentBlock",
  labels: { singular: "正文", plural: "正文" },
  fields: [
    {
      name: "columns",
      label: "内容列",
      type: "array",
      required: true,
      minRows: 1,
      admin: { initCollapsed: true },
      fields: [
        {
          name: "size",
          label: "宽度",
          type: "select",
          required: true,
          defaultValue: "full",
          options: [
            { label: "整行", value: "full" },
            { label: "二分之一", value: "half" },
            { label: "三分之一", value: "oneThird" },
            { label: "三分之二", value: "twoThirds" },
          ],
        },
        richText(),
        { name: "enableLink", label: "添加链接", type: "checkbox" },
        {
          ...websiteLink(),
          admin: { condition: (_, { enableLink }) => Boolean(enableLink) },
        },
      ],
    },
  ],
}

const media: Block = {
  slug: "mediaBlock",
  interfaceName: "PageMediaBlock",
  labels: { singular: "媒体", plural: "媒体" },
  fields: [
    {
      name: "media",
      label: "素材",
      type: "upload",
      relationTo: "media",
      hasMany: true,
      required: true,
    },
    {
      name: "display",
      label: "展示方式",
      type: "select",
      required: true,
      defaultValue: "featured",
      options: [
        { label: "通栏", value: "featured" },
        { label: "图库", value: "gallery" },
      ],
    },
    { name: "caption", label: "说明", type: "text", localized: true },
  ],
}

const callToAction: Block = {
  slug: "cta",
  interfaceName: "PageCallToActionBlock",
  labels: { singular: "行动按钮", plural: "行动按钮" },
  fields: [richText(), links()],
}

const archive: Block = {
  slug: "archive",
  interfaceName: "PageArchiveBlock",
  labels: { singular: "博客归档", plural: "博客归档" },
  fields: [
    richText("introContent", "导语"),
    {
      name: "populateBy",
      label: "选取方式",
      type: "select",
      required: true,
      defaultValue: "collection",
      options: [
        { label: "从分类读取", value: "collection" },
        { label: "手动选择博客", value: "selection" },
      ],
    },
    {
      name: "categories",
      label: "分类",
      type: "relationship",
      relationTo: "categories",
      hasMany: true,
      admin: { condition: (_, { populateBy }) => populateBy === "collection" },
    },
    {
      name: "limit",
      label: "显示数量",
      type: "number",
      defaultValue: 6,
      min: 1,
      max: 24,
      admin: {
        step: 1,
        condition: (_, { populateBy }) => populateBy === "collection",
      },
    },
    {
      name: "selectedDocs",
      label: "博客",
      type: "relationship",
      relationTo: "posts",
      hasMany: true,
      required: true,
      filterOptions: { _status: { equals: "published" } },
      admin: { condition: (_, { populateBy }) => populateBy === "selection" },
    },
  ],
}

const form: Block = {
  slug: "formBlock",
  interfaceName: "PageFormBlock",
  labels: { singular: "表单", plural: "表单" },
  fields: [
    { name: "form", label: "表单", type: "relationship", relationTo: "forms", required: true },
    richText("introContent", "表单说明"),
  ],
}

export const pageLayout: Field = {
  name: "layout",
  label: "页面区块",
  labels: { singular: "区块", plural: "区块" },
  type: "blocks",
  blocks: [content, callToAction, media, archive, form],
  required: true,
  admin: { initCollapsed: true },
}

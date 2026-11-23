import type { ArrayField, Field, GlobalConfig } from "payload"
import { isAdmin, isStaff } from "../access"
import { websiteLink } from "../fields/website-link"

const layoutGroup = "网站布局"
const access = { read: isStaff, update: isAdmin }
const menuRows: ArrayField["admin"] = {
  initCollapsed: true,
  components: { RowLabel: "/cms/admin/layout-row-label#LayoutRowLabel" },
}

function requiredText(name: string, label: string): Field {
  return { name, label, type: "text", required: true }
}

export const StorefrontHeader: GlobalConfig = {
  slug: "storefront-header",
  label: "页眉",
  admin: { group: layoutGroup, description: "保存后应用到店面的桌面和移动端页眉。" },
  access,
  fields: [
    {
      name: "logo",
      label: "店面 Logo",
      type: "upload",
      relationTo: "media",
      required: true,
      filterOptions: { mimeType: { in: ["image/png", "image/webp"] } },
      admin: { description: "使用透明背景的 PNG 或 WebP。页脚和结账页也使用此 Logo。" },
    },
    {
      name: "catalog",
      label: "商品菜单",
      type: "group",
      admin: { description: "商品分类会从 Medusa 自动读取。" },
      fields: [requiredText("label", "菜单名称"), requiredText("compareLabel", "比较入口名称")],
    },
    {
      name: "navItems",
      labels: { singular: "菜单项", plural: "菜单项" },
      label: "主导航",
      type: "array",
      maxRows: 6,
      admin: menuRows,
      fields: [
        websiteLink(),
        {
          name: "mobileLabel",
          label: "移动端名称",
          type: "text",
          admin: { description: "留空时使用同一个显示名称。" },
        },
        {
          name: "children",
          label: "子菜单",
          labels: { singular: "子菜单项", plural: "子菜单项" },
          type: "array",
          admin: menuRows,
          fields: [websiteLink()],
        },
      ],
    },
    requiredText("mobileSubtitle", "移动菜单副标题"),
  ],
}

export const StorefrontFooter: GlobalConfig = {
  slug: "storefront-footer",
  label: "页脚",
  admin: { group: layoutGroup, description: "保存后应用到店面页脚。" },
  access,
  fields: [
    requiredText("tagline", "品牌标语"),
    requiredText("marketLabel", "地区文字"),
    {
      name: "catalog",
      label: "商品链接栏",
      type: "group",
      admin: { description: "商品分类会从 Medusa 自动读取。" },
      fields: [
        requiredText("label", "栏目名称"),
        requiredText("storeLabel", "全部商品入口名称"),
        requiredText("compareLabel", "比较入口名称"),
      ],
    },
    {
      name: "columns",
      label: "内容链接栏",
      labels: { singular: "链接栏", plural: "链接栏" },
      type: "array",
      maxRows: 2,
      admin: menuRows,
      fields: [
        requiredText("label", "栏目名称"),
        {
          name: "navItems",
          label: "链接",
          labels: { singular: "链接", plural: "链接" },
          type: "array",
          admin: menuRows,
          fields: [websiteLink()],
        },
      ],
    },
    requiredText("copyright", "版权文字"),
    {
      name: "policies",
      label: "政策链接",
      labels: { singular: "政策链接", plural: "政策链接" },
      type: "array",
      admin: menuRows,
      fields: [websiteLink()],
    },
  ],
}

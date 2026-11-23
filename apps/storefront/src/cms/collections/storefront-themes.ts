import { APIError, type CollectionConfig, type TextField } from "payload"
import { storefrontPalette, validateThemeColor } from "@lib/storefront-theme"
import { adminAccess, isStaff } from "../access"
import { storefrontThemeGroup } from "../globals/storefront-appearance"

const colorLabels: Record<keyof typeof storefrontPalette, string> = {
  background: "页面背景",
  foreground: "正文颜色",
  surface: "卡片与弹层背景",
  secondary: "次要按钮背景",
  muted: "浅层背景",
  mutedForeground: "次要文字",
  border: "分隔线",
  input: "输入框边框",
  primary: "主按钮与品牌色",
  primaryForeground: "主按钮文字",
  accent: "选中背景",
  accentForeground: "选中文字",
}

const colorFields = (Object.keys(colorLabels) as Array<
  keyof typeof storefrontPalette
>).map<TextField>((name) => ({
  name,
  label: colorLabels[name],
  type: "text",
  required: true,
  defaultValue: storefrontPalette[name],
  validate: validateThemeColor,
  admin: {
    components: { Field: "/cms/admin/theme-color-field#ThemeColorField" },
  },
}))

export const StorefrontThemes: CollectionConfig = {
  slug: "storefront-themes",
  labels: { singular: "主题", plural: "主题库" },
  admin: {
    group: storefrontThemeGroup,
    useAsTitle: "name",
    defaultColumns: ["name", "scheme", "fontFamily", "updatedAt"],
  },
  access: { ...adminAccess, read: isStaff },
  hooks: {
    beforeDelete: [
      async ({ id, req }) => {
        const { activeTheme } = await req.payload.findGlobal({
          slug: "storefront-appearance",
          depth: 0,
          req,
        })
        if (String(activeTheme) === String(id)) {
          throw new APIError("请先启用另一套主题，再删除当前主题。", 409)
        }
      },
    ],
  },
  fields: [
    { name: "name", label: "主题名称", type: "text", required: true },
    {
      type: "tabs",
      tabs: [
        {
          label: "配色",
          fields: [
            {
              name: "scheme",
              label: "明暗模式",
              type: "select",
              required: true,
              defaultValue: "light",
              options: [
                { label: "浅色", value: "light" },
                { label: "深色", value: "dark" },
              ],
            },
            {
              name: "colors",
              label: "主题色板",
              type: "group",
              admin: { className: "storefront-theme-palette" },
              fields: colorFields,
            },
          ],
        },
        {
          label: "字体与控件",
          fields: [
            {
              name: "fontFamily",
              label: "全站字体",
              type: "select",
              required: true,
              defaultValue: "noto-sans-kr",
              options: [
                { label: "Noto Sans KR", value: "noto-sans-kr" },
                { label: "系统无衬线", value: "system-sans" },
                { label: "衬线字体", value: "system-serif" },
              ],
            },
            {
              name: "cornerRadius",
              label: "基础圆角（px）",
              type: "number",
              required: true,
              min: 0,
              max: 32,
              defaultValue: 12,
              admin: { step: 1 },
            },
            {
              name: "buttonShape",
              label: "按钮形状",
              type: "select",
              required: true,
              defaultValue: "original",
              options: [
                { label: "品牌默认", value: "original" },
                { label: "直角", value: "square" },
                { label: "主题圆角", value: "rounded" },
                { label: "胶囊", value: "pill" },
              ],
            },
          ],
        },
      ],
    },
  ],
}

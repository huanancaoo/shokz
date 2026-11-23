import type { GlobalConfig } from "payload"
import { isAdmin, isStaff } from "../access"

export const storefrontThemeGroup = "网站主题"

export const StorefrontAppearance: GlobalConfig = {
  slug: "storefront-appearance",
  label: "当前主题",
  admin: {
    group: storefrontThemeGroup,
    description: "保存后，店面的所有页面使用所选主题。",
  },
  access: { read: isStaff, update: isAdmin },
  fields: [
    {
      name: "activeTheme",
      label: "生效主题",
      type: "relationship",
      relationTo: "storefront-themes",
      required: true,
    },
  ],
}

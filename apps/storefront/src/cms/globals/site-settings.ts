import type { GlobalConfig } from "payload"
import { isAdmin, isStaff } from "../access"

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  label: "网站设置",
  access: { read: isStaff, update: isAdmin, readVersions: isStaff },
  versions: true,
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      localized: true,
      defaultValue: "SHOKZ Korea",
    },
    { name: "description", type: "textarea", localized: true },
  ],
}

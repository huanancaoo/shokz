import type { GroupField } from "payload"

export function websiteLink(label = "链接"): GroupField {
  return {
    name: "link",
    label,
    type: "group",
    fields: [
      { name: "label", label: "显示名称", type: "text", required: true },
      {
        type: "row",
        fields: [
          {
            name: "type",
            label: "链接类型",
            type: "radio",
            required: true,
            defaultValue: "reference",
            admin: { layout: "horizontal" },
            options: [
              { label: "站内内容", value: "reference" },
              { label: "自定义地址", value: "custom" },
            ],
          },
          { name: "newTab", label: "在新标签页打开", type: "checkbox" },
        ],
      },
      {
        name: "reference",
        label: "页面或博客",
        type: "relationship",
        relationTo: ["pages", "posts"],
        required: true,
        filterOptions: { _status: { equals: "published" } },
        admin: { condition: (_, siblingData) => siblingData.type === "reference" },
      },
      {
        name: "url",
        label: "链接地址",
        type: "text",
        required: true,
        admin: {
          condition: (_, siblingData) => siblingData.type === "custom",
          description: "站内填写不含地区前缀的路径，如 /pages/faq。站外填写 HTTPS 地址。",
        },
        validate: (value: unknown) =>
          (typeof value === "string" &&
            (/^\/(?![/\\])[^\s\\]*$/.test(value) ||
              (/^https:\/\/[^/\s\\][^\s\\]*$/i.test(value) && URL.canParse(value)))) ||
          "请填写站内路径或完整的 HTTPS 地址。",
      },
    ],
  }
}

import type { BeforeSync } from "@payloadcms/plugin-search/types"
import { convertLexicalToPlaintext } from "@payloadcms/richtext-lexical/plaintext"
import type { Field } from "payload"
import type { Page, Post } from "@/payload-types"

export const searchFields: Field[] = [
  { name: "slug", type: "text", index: true, admin: { readOnly: true } },
  {
    name: "meta",
    type: "group",
    admin: { readOnly: true },
    fields: [
      { name: "title", type: "text", localized: true },
      { name: "description", type: "textarea", localized: true },
    ],
  },
  { name: "text", label: "正文索引", type: "textarea", localized: true, admin: { hidden: true } },
]

function pageText(doc: Page) {
  const body = (doc.layout ?? []).flatMap((block) => {
    switch (block.blockType) {
      case "content":
        return block.columns.map(({ richText }) => richText)
      case "cta":
        return [block.richText]
      case "archive":
      case "formBlock":
        return [block.introContent]
      case "mediaBlock":
        return []
    }
  })
  return [doc.hero?.richText, ...body]
}

export const syncContentSearch: BeforeSync = ({ collectionSlug, originalDoc, searchDoc }) => {
  const doc = originalDoc as Page | Post
  const body = collectionSlug === "pages" ? pageText(doc as Page) : [(doc as Post).body]

  return {
    ...searchDoc,
    title: doc.title,
    slug: doc.slug,
    meta: { title: doc.meta?.title, description: doc.meta?.description },
    text: body.flatMap((data) => data ? [convertLexicalToPlaintext({ data })] : []).join("\n"),
  }
}

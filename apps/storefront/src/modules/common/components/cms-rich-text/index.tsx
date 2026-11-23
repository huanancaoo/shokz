import type { SerializedLinkNode } from "@payloadcms/richtext-lexical"
import {
  LinkJSXConverter,
  RichText,
  type JSXConvertersFunction,
} from "@payloadcms/richtext-lexical/react"
import type { Post } from "@/payload-types"

export default function CmsRichText({
  data,
  countryCode,
}: {
  data: Post["body"]
  countryCode: string
}) {
  const converters: JSXConvertersFunction = ({ defaultConverters }) => ({
    ...defaultConverters,
    ...LinkJSXConverter({
      internalDocToHref: ({ linkNode }: { linkNode: SerializedLinkNode }) => {
        const doc = linkNode.fields.doc
        if (!doc || typeof doc.value !== "object" || !doc.value) return ""
        if (doc.relationTo === "medusa-products")
          return `/${countryCode}/products/${doc.value.handle}`
        if (doc.relationTo === "posts" && doc.value._status === "published") {
          return `/${countryCode}/journal/${doc.value.slug}`
        }
        if (doc.relationTo === "pages" && doc.value._status === "published") {
          const { breadcrumbs } = doc.value
          const url = Array.isArray(breadcrumbs)
            ? breadcrumbs.at(-1)?.url
            : undefined
          if (typeof url === "string") return `/${countryCode}${url}`
        }
        return ""
      },
    }),
  })

  return <RichText data={data} converters={converters} disableContainer />
}

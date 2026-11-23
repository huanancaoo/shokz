import { FixedToolbarFeature, lexicalEditor } from "@payloadcms/richtext-lexical"

export const editorialText = lexicalEditor({
  features: ({ rootFeatures }) => [...rootFeatures, FixedToolbarFeature()],
})

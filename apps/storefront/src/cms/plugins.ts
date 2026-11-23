import path from "node:path"
import { formBuilderPlugin } from "@payloadcms/plugin-form-builder"
import { importExportPlugin } from "@payloadcms/plugin-import-export"
import { mcpPlugin } from "@payloadcms/plugin-mcp"
import { nestedDocsPlugin } from "@payloadcms/plugin-nested-docs"
import { redirectsPlugin } from "@payloadcms/plugin-redirects"
import { searchPlugin } from "@payloadcms/plugin-search"
import { seoPlugin } from "@payloadcms/plugin-seo"
import type { CollectionConfig } from "payload"
import { adminAccess, isAdmin, isStaff } from "./access"
import { contentCollections, editorialPath } from "./content-model"
import { searchFields, syncContentSearch } from "./search"

function privateTransferFiles({
  collection,
}: {
  collection: CollectionConfig
}): CollectionConfig {
  return {
    ...collection,
    access: {
      ...collection.access,
      create: isAdmin,
      read: isAdmin,
      delete: isAdmin,
    },
    upload: {
      ...(typeof collection.upload === "object" ? collection.upload : {}),
      staticDir: path.join(process.cwd(), "data", "payload", collection.slug),
    },
  }
}

export const cmsPlugins = [
  nestedDocsPlugin({
    collections: ["pages", "categories"],
    generateLabel: (_docs, doc) => String(doc.title ?? ""),
    generateURL: (docs, _doc, { slug }) =>
      `${slug === "pages" ? "/pages" : ""}/${docs.map((doc) => doc.slug).join("/")}`,
  }),
  redirectsPlugin({
    collections: ["pages", "posts"],
    redirectTypes: ["307", "308"],
    redirectTypeFieldOverride: { defaultValue: "308" },
    overrides: { access: adminAccess, admin: { group: "内容" } },
  }),
  seoPlugin({
    collections: ["pages", "posts"],
    uploadsCollection: "media",
    tabbedUI: true,
    generateTitle: ({ doc }) => doc?.title ? `${doc.title} | SHOKZ Korea` : "SHOKZ Korea",
    generateURL: ({ collectionConfig, doc, req }) => {
      const collection = collectionConfig?.slug
      if (collection !== "pages" && collection !== "posts") return ""
      const path = editorialPath(collection, doc)
      if (!path) return ""

      const country = (process.env.NEXT_PUBLIC_DEFAULT_REGION || "kr").toLowerCase()
      const origin = process.env.NEXT_PUBLIC_BASE_URL || req.payload.config.serverURL
      return new URL(`/${country}${path}`, origin).href
    },
  }),
  searchPlugin({
    collections: ["pages", "posts"],
    localize: true,
    beforeSync: syncContentSearch,
    searchOverrides: {
      access: { read: isStaff, update: isAdmin, delete: isAdmin },
      admin: { group: "内容" },
      fields: ({ defaultFields }) => [
        ...defaultFields.map((field) => field.type === "relationship" && field.name === "doc"
          ? { ...field, maxDepth: 1 }
          : field),
        ...searchFields,
      ],
    },
  }),
  formBuilderPlugin({
    fields: { date: true, radio: true, upload: true, payment: false },
    uploadCollections: ["form-uploads"],
    redirectRelationships: ["pages"],
    formOverrides: { access: adminAccess, admin: { group: "表单" } },
    formSubmissionOverrides: {
      access: { create: isStaff, read: isAdmin, delete: isAdmin },
      admin: { group: "表单" },
    },
  }),
  importExportPlugin({
    collections: contentCollections.map((slug) => ({ slug })),
    defaultVersionStatus: "draft",
    overrideExportCollection: privateTransferFiles,
    overrideImportCollection: privateTransferFiles,
  }),
  mcpPlugin({
    collections: {
      pages: { enabled: true },
      posts: { enabled: true },
      banners: { enabled: true },
    },
    globals: { "site-settings": { enabled: true } },
  }),
]

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
import { contentCollections } from "./content-model"

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
    collections: ["pages"],
    generateLabel: (_docs, doc) => String(doc.title ?? ""),
    generateURL: (docs) => `/pages/${docs.map((doc) => doc.slug).join("/")}`,
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
    generateTitle: ({ doc }) => `${doc.title} | SHOKZ Korea`,
  }),
  searchPlugin({
    collections: ["pages", "posts"],
    localize: true,
    searchOverrides: {
      access: { read: isStaff, update: isAdmin, delete: isAdmin },
      admin: { group: "内容" },
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

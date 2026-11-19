import path from "node:path"
import { postgresAdapter } from "@payloadcms/db-postgres"
import { nodemailerAdapter } from "@payloadcms/email-nodemailer"
import {
  lexicalEditor,
  LinkFeature,
  UploadFeature,
} from "@payloadcms/richtext-lexical"
import { en } from "@payloadcms/translations/languages/en"
import { ko } from "@payloadcms/translations/languages/ko"
import { zh } from "@payloadcms/translations/languages/zh"
import { buildConfig } from "payload"
import sharp from "sharp"
import { isStaff } from "./cms/access"
import { withCmsListViews } from "./cms/admin/list/config"
import { CommerceSync, Users } from "./cms/collections/accounts"
import { Banners, Pages, Posts } from "./cms/collections/editorial"
import { FormUploads, Media } from "./cms/collections/media"
import { MedusaProducts } from "./cms/collections/medusa-products"
import { contentCollections, relationID } from "./cms/content-model"
import { SiteSettings } from "./cms/globals/site-settings"
import { cmsPlugins } from "./cms/plugins"

const {
  PAYLOAD_DATABASE_URL,
  PAYLOAD_SECRET,
  PAYLOAD_SERVER_URL,
  CMS_EMAIL_FROM,
  CMS_SMTP_HOST,
  CMS_SMTP_PORT,
} = process.env

if (!PAYLOAD_DATABASE_URL || !PAYLOAD_SECRET || !PAYLOAD_SERVER_URL) {
  throw new Error(
    "Set PAYLOAD_DATABASE_URL, PAYLOAD_SECRET and PAYLOAD_SERVER_URL for Storefront"
  )
}

if (!CMS_EMAIL_FROM || !CMS_SMTP_HOST || !CMS_SMTP_PORT) {
  throw new Error(
    "Set CMS_EMAIL_FROM, CMS_SMTP_HOST and CMS_SMTP_PORT for Payload email"
  )
}

export default buildConfig({
  admin: {
    user: "users",
    theme: "dark",
    meta: { titleSuffix: "– Shokz 内容管理" },
    components: {
      graphics: {
        Logo: "/cms/admin/branding#ShokzLogo",
        Icon: "/cms/admin/branding#ShokzLogo",
      },
      Nav: "/cms/admin/sidebar#AdminSidebar",
      views: { login: { Component: "/cms/admin/login#AdminLogin" } },
    },
    dashboard: {
      widgets: [
        {
          slug: "content-overview",
          label: { en: "Website content", ko: "웹사이트 콘텐츠", zh: "网站内容" },
          Component: "/cms/admin/content-home#ContentHome",
          minWidth: "full",
          maxWidth: "full",
        },
      ],
      defaultLayout: [{ widgetSlug: "content-overview", width: "full" }],
    },
    importMap: {
      baseDir: path.resolve("src"),
      importMapFile: path.resolve("src/app/(payload)/admin/importMap.js"),
    },
    livePreview: {
      collections: [...contentCollections],
      url: ({ collectionConfig, data, locale }) => {
        const id = relationID(data.id)
        if (!collectionConfig || !id) return
        return new URL(
          `/cms-preview/${collectionConfig.slug}/${id}?locale=${locale.code}`,
          PAYLOAD_SERVER_URL
        ).href
      },
    },
  },
  collections: [
    Users,
    CommerceSync,
    Pages,
    Posts,
    Banners,
    Media,
    FormUploads,
    MedusaProducts,
  ],
  globals: [SiteSettings],
  cookiePrefix: "shokz-cms",
  db: postgresAdapter({
    pool: { connectionString: PAYLOAD_DATABASE_URL },
    migrationDir: path.resolve("src/cms/migrations"),
    push: false,
  }),
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures.filter(
        ({ key }) => key !== "link" && key !== "upload"
      ),
      LinkFeature({
        enabledCollections: ["pages", "posts", "medusa-products"],
      }),
      UploadFeature({ enabledCollections: ["media"] }),
    ],
  }),
  email: nodemailerAdapter({
    defaultFromAddress: CMS_EMAIL_FROM,
    defaultFromName: "Shokz CMS",
    transportOptions: { host: CMS_SMTP_HOST, port: Number(CMS_SMTP_PORT) },
    skipVerify: true,
  }),
  i18n: { supportedLanguages: { zh, en, ko }, fallbackLanguage: "zh" },
  localization: { locales: ["ko", "en", "zh"], defaultLocale: "ko" },
  jobs: {
    access: { run: isStaff, queue: isStaff, cancel: isStaff },
    autoRun: [{ cron: "* * * * *", allQueues: true }],
  },
  plugins: [...cmsPlugins, withCmsListViews],
  secret: PAYLOAD_SECRET,
  serverURL: PAYLOAD_SERVER_URL,
  sharp,
  telemetry: false,
  typescript: { outputFile: path.resolve("src/payload-types.ts") },
})

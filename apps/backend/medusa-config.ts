import { loadEnv, defineConfig } from "@medusajs/framework/utils"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

const publicUrl = process.env.MEDUSA_PUBLIC_URL ?? "http://localhost:9001"
const catalogUrl = process.env.PAYLOAD_CATALOG_URL
const catalogApiKey = process.env.PAYLOAD_CATALOG_API_KEY

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      cookieSecret: process.env.COOKIE_SECRET,
    },
  },
  modules: [
    ...(catalogUrl && catalogApiKey
      ? [{
          resolve: "./src/modules/payload-catalog",
          options: { url: catalogUrl, apiKey: catalogApiKey },
        }]
      : []),
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-local",
            id: "local",
            options: {
              upload_dir: "static",
              backend_url: new URL("/static", publicUrl).href,
            },
          },
        ],
      },
    },
  ],
})

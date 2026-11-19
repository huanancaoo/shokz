import path from "node:path"
import { withPayload } from "@payloadcms/next/withPayload"
import checkEnvVariables from "./check-env-variables.js"

checkEnvVariables()

/**
 * Medusa Cloud-related environment variables
 */
const S3_HOSTNAME = process.env.MEDUSA_CLOUD_S3_HOSTNAME
const S3_PATHNAME = process.env.MEDUSA_CLOUD_S3_PATHNAME
const mediaOrigin = new URL(process.env.MEDUSA_PUBLIC_URL ?? "http://localhost:9001")
const medusaBackend = new URL(process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ?? "http://localhost:9001")
const selfHosted = process.env.SHOKZ_SELF_HOSTED === "1"
const defaultCountryCode = (
  process.env.NEXT_PUBLIC_DEFAULT_REGION || "kr"
).toLowerCase()

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  ...(selfHosted ? { output: "standalone", experimental: { cpus: 1 } } : {}),
  outputFileTracingRoot: path.resolve(import.meta.dirname, "../.."),
  env: { NEXT_PUBLIC_MEDUSA_MEDIA_ORIGIN: mediaOrigin.origin },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [{ key: "Link", value: '</.well-known/ucp>; rel="ucp"' }],
      },
      {
        source: "/:countryCode/products/:handle",
        headers: [{ key: "Vary", value: "Accept" }],
      },
    ]
  },
  async redirects() {
    return [
      { source: "/", destination: `/${defaultCountryCode}`, permanent: false },
    ]
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          // Resolve optimizer requests through the storefront router and the internal Medusa address.
          source: "/assets/medusa/:file([^/]+\\.(?:avif|gif|jpe?g|png|webp))",
          destination: new URL("/static/:file", medusaBackend).href,
        },
        {
          source: "/:countryCode/products/:handle([^/.]+).md",
          destination: "/:countryCode/products/:handle/markdown",
        },
        {
          source: "/:countryCode/products/:handle([^/.]+)",
          has: [{ type: "header", key: "accept", value: ".*text/markdown.*" }],
          destination: "/:countryCode/products/:handle/markdown",
        },
      ],
    }
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    qualities: [75, 90],
    unoptimized: false,
    dangerouslyAllowLocalIP: mediaOrigin.hostname === "localhost",
    remotePatterns: [
      new URL("/static/**", mediaOrigin),
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "*.s3.amazonaws.com",
      },
      ...(S3_HOSTNAME && S3_PATHNAME
        ? [
            {
              protocol: "https",
              hostname: S3_HOSTNAME,
              pathname: S3_PATHNAME,
            },
          ]
        : []),
    ],
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })

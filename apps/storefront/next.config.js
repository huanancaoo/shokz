const path = require("node:path")
const checkEnvVariables = require("./check-env-variables")

checkEnvVariables()

/**
 * Medusa Cloud-related environment variables
 */
const S3_HOSTNAME = process.env.MEDUSA_CLOUD_S3_HOSTNAME
const S3_PATHNAME = process.env.MEDUSA_CLOUD_S3_PATHNAME
const mediaOrigin = new URL(process.env.MEDUSA_PUBLIC_URL ?? "http://localhost:9001")
const selfHosted = process.env.SHOKZ_SELF_HOSTED === "1"

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  ...(selfHosted ? { output: "standalone", experimental: { cpus: 1 } } : {}),
  outputFileTracingRoot: path.resolve(__dirname, "../.."),
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
  async rewrites() {
    return {
      beforeFiles: [
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
    // 本地媒体由同机的 Medusa 提供，公开部署则从配置的 HTTPS 域名读取。
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

module.exports = nextConfig

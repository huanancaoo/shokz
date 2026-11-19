import { getTranslation } from "@payloadcms/translations"
import Image from "next/image"
import Link from "next/link"
import type { ServerProps } from "payload"

export function ShokzLogo() {
  // Payload 的 Open Graph 图片也会渲染 Icon，因此使用可独立加载的绝对地址。
  const src = new URL(
    "/assets/shokz-logo-white.png",
    process.env.PAYLOAD_SERVER_URL
  )

  return (
    <Image
      alt="Shokz"
      className="shokz-wordmark"
      height={56}
      src={src.href}
      unoptimized
      width={188}
    />
  )
}

export function SidebarBrand({
  i18n,
  payload,
}: Pick<ServerProps, "i18n" | "payload">) {
  return (
    <Link
      aria-label={getTranslation(
        { en: "Shokz dashboard", ko: "Shokz 대시보드", zh: "Shokz 后台首页" },
        i18n
      )}
      className="shokz-sidebar-brand"
      href={payload.config.routes.admin}
      prefetch={false}
    >
      <ShokzLogo />
    </Link>
  )
}

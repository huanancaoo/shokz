import Image from "next/image"
import type { ComponentProps } from "react"

const medusaStaticPrefix = `${process.env.NEXT_PUBLIC_MEDUSA_MEDIA_ORIGIN}/static/`
const rasterExtension = /\.(?:avif|gif|jpe?g|png|webp)(?=[?#]|$)/i

export default function StoreImage({ src, ...props }: ComponentProps<typeof Image>) {
  const storefrontSrc =
    typeof src === "string" &&
    src.startsWith(medusaStaticPrefix) &&
    rasterExtension.test(src)
      ? `/assets/medusa/${src.slice(medusaStaticPrefix.length)}`
      : src

  return <Image {...props} src={storefrontSrc} />
}

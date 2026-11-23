import type { ComponentProps } from "react"
import Link from "next/link"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function StorefrontContentLink({
  newTab,
  ...props
}: ComponentProps<typeof LocalizedClientLink> & { newTab?: boolean }) {
  const LinkComponent = props.href.startsWith("/") ? LocalizedClientLink : Link
  return (
    <LinkComponent
      {...props}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noopener noreferrer" : undefined}
    />
  )
}

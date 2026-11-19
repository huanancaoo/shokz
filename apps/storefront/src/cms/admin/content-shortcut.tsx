"use client"

import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import type { ComponentProps } from "react"
import { Badge } from "@modules/common/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@modules/common/components/ui/card"

type ContentShortcutProps = {
  count: string
  description: string
  href: string
  icon: ComponentProps<typeof HugeiconsIcon>["icon"]
  label: string
  status?: string
}

export function ContentShortcut({
  count,
  description,
  href,
  icon,
  label,
  status,
}: ContentShortcutProps) {
  return (
    <Link
      className="shokz-content-shortcut block h-full rounded-xl"
      href={href}
      prefetch={false}
    >
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2">
            <HugeiconsIcon aria-hidden="true" icon={icon} size={17} />
            {label}
            {status && <Badge variant="outline">{status}</Badge>}
          </CardTitle>
          <CardAction>
            <HugeiconsIcon
              aria-hidden="true"
              className="text-muted-foreground"
              icon={ArrowRight01Icon}
              size={18}
            />
          </CardAction>
        </CardHeader>
        <CardContent className="grid gap-1">
          <strong className="shokz-shortcut-count">{count}</strong>
          <CardDescription>{description}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  )
}

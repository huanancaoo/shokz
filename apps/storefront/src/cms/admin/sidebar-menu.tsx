"use client"

import {
  ArrowDown01Icon,
  Cancel01Icon,
  DashboardSquare01Icon,
  Logout01Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { NavWrapper } from "@payloadcms/next/client"
import { useNav } from "@payloadcms/ui"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type { ReactNode } from "react"
import { Button } from "@modules/common/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@modules/common/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@modules/common/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@modules/common/components/ui/sidebar"

type Entry = { href: string; label: string }

type SidebarProps = {
  account: Entry
  brand: ReactNode
  closeLabel: string
  groups: Array<{ label: string; links: Entry[]; primary: boolean }>
  home: Entry
  logout: Entry
  profileLabel: string
}

export function PayloadSidebar({
  account,
  brand,
  closeLabel,
  groups,
  home,
  logout,
  profileLabel,
}: SidebarProps) {
  const pathname = usePathname()
  const { setNavOpen } = useNav()
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/")

  return (
    // Payload 的布局依赖 NavWrapper 处理侧栏宽度、焦点和移动端开合。
    <NavWrapper baseClass="nav">
      <Sidebar className="shokz-sidebar">
        <SidebarHeader className="gap-2 border-0 border-b border-solid border-border px-3 pb-3 pt-2">
          <div className="flex items-center justify-between gap-1">
            {brand}
            <Button
              aria-label={closeLabel}
              className="min-[769px]:hidden"
              onClick={() => setNavOpen(false)}
              size="icon-sm"
              variant="ghost"
            >
              <HugeiconsIcon aria-hidden="true" icon={Cancel01Icon} />
            </Button>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger render={<SidebarMenuButton />}>
              <HugeiconsIcon aria-hidden="true" icon={UserCircleIcon} />
              <span className="min-w-0 flex-1 truncate">{profileLabel}</span>
              <HugeiconsIcon aria-hidden="true" icon={ArrowDown01Icon} />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                render={<Link href={account.href} prefetch={false} />}
              >
                <HugeiconsIcon aria-hidden="true" icon={UserCircleIcon} />
                {account.label}
              </DropdownMenuItem>
              <DropdownMenuItem
                render={<Link href={logout.href} prefetch={false} />}
              >
                <HugeiconsIcon aria-hidden="true" icon={Logout01Icon} />
                {logout.label}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarHeader>
        <SidebarContent aria-label={home.label}>
          <SidebarGroup className="p-3">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  aria-current={pathname === home.href ? "page" : undefined}
                  isActive={pathname === home.href}
                  render={<Link href={home.href} prefetch={false} />}
                >
                  <HugeiconsIcon
                    aria-hidden="true"
                    icon={DashboardSquare01Icon}
                  />
                  {home.label}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
          {groups.map(({ label, links, primary }) => (
            <Collapsible
              defaultOpen={primary || links.some(({ href }) => isActive(href))}
              key={label}
            >
              <SidebarGroup className="border-0 border-t border-solid border-border px-3">
                <SidebarGroupLabel
                  className="group w-full justify-between border-0 bg-transparent hover:bg-muted hover:text-foreground"
                  render={<CollapsibleTrigger />}
                >
                  {label}
                  <HugeiconsIcon
                    aria-hidden="true"
                    className="size-3.5 -rotate-90 group-aria-expanded:rotate-0"
                    icon={ArrowDown01Icon}
                  />
                </SidebarGroupLabel>
                <CollapsibleContent>
                  <SidebarMenu>
                    {links.map(({ href, label }) => (
                      <SidebarMenuItem key={href}>
                        <SidebarMenuButton
                          aria-current={isActive(href) ? "page" : undefined}
                          isActive={isActive(href)}
                          render={<Link href={href} prefetch={false} />}
                        >
                          <span className="truncate">{label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          ))}
        </SidebarContent>
      </Sidebar>
    </NavWrapper>
  )
}

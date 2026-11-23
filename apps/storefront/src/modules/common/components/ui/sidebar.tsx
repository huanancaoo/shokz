"use client"

import type { ComponentProps } from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cn } from "@lib/utils"

function Sidebar({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar"
      className={cn(
        "flex h-full w-full flex-col bg-card text-card-foreground",
        className
      )}
      {...props}
    />
  )
}

function SidebarHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-header"
      className={cn("flex flex-col gap-2 p-2", className)}
      {...props}
    />
  )
}

function SidebarContent({ className, ...props }: ComponentProps<"nav">) {
  return (
    <nav
      data-slot="sidebar-content"
      className={cn("flex min-h-0 flex-1 flex-col overflow-auto", className)}
      {...props}
    />
  )
}

function SidebarGroup({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group"
      className={cn("flex w-full min-w-0 flex-col p-2", className)}
      {...props}
    />
  )
}

function SidebarGroupLabel({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "flex h-8 shrink-0 items-center rounded-md px-2 text-base font-medium text-muted-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring",
          className
        ),
      },
      props
    ),
    render,
    state: { slot: "sidebar-group-label" },
  })
}

function SidebarMenu({ className, ...props }: ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      className={cn(
        "m-0 flex w-full min-w-0 list-none flex-col p-0",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuItem({ className, ...props }: ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  )
}

function SidebarMenuButton({
  render,
  isActive = false,
  className,
  ...props
}: useRender.ComponentProps<"button"> & { isActive?: boolean }) {
  return useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(
      {
        className: cn(
          "flex h-8 w-full min-w-0 items-center gap-2 overflow-hidden rounded-md border-0 bg-transparent px-2 py-0 text-left text-lg text-inherit no-underline",
          "hover:bg-accent hover:text-accent-foreground hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring",
          "data-[open]:bg-accent data-[active]:bg-accent data-[active]:font-medium data-[active]:text-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0",
          className
        ),
      },
      props
    ),
    render,
    state: { slot: "sidebar-menu-button", active: isActive },
  })
}

export {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
}

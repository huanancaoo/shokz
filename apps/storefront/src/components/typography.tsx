import type { HTMLAttributes } from "react"
import { cn } from "@lib/utils"

export function Text({
  as: Component = "p",
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement> & { as?: "p" | "span" | "div" }) {
  return (
    <Component
      className={cn("text-sm leading-relaxed", className)}
      {...props}
    />
  )
}

export function Heading({
  level: Component = "h2",
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement> & { level?: "h1" | "h2" | "h3" }) {
  return (
    <Component
      className={cn(
        "font-semibold tracking-tight",
        {
          "text-3xl": Component === "h1",
          "text-2xl": Component === "h2",
          "text-xl": Component === "h3",
        },
        className
      )}
      {...props}
    />
  )
}

import type { CSSProperties } from "react"
import type { StorefrontTheme } from "@/payload-types"

export const storefrontPalette = {
  background: "#ffffff",
  foreground: "#171717",
  surface: "#ffffff",
  secondary: "#f2f0ee",
  muted: "#f5f4f1",
  mutedForeground: "#6b6864",
  border: "#e5e3df",
  input: "#d1ccc7",
  primary: "#ff6008",
  primaryForeground: "#171717",
  accent: "#fff3eb",
  accentForeground: "#983600",
}

export const storefrontFonts = {
  "noto-sans-kr": '"Noto Sans KR", sans-serif',
  "system-sans": 'system-ui, "Noto Sans KR", sans-serif',
  "system-serif": 'Georgia, "Noto Serif CJK KR", "Noto Sans KR", serif',
}

export function isThemeColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value)
}

export function validateThemeColor(value: unknown) {
  return isThemeColor(value) || "请输入 #RRGGBB 格式的颜色。"
}

function hslChannels(hex: string) {
  const [red, green, blue] = [1, 3, 5].map(
    (offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255
  )
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const chroma = max - min
  const lightness = (max + min) / 2

  if (!chroma) return `0 0% ${lightness * 100}%`

  const saturation = chroma / (1 - Math.abs(2 * lightness - 1))
  let hue = (red - green) / chroma + 4
  if (max === red) hue = ((green - blue) / chroma + 6) % 6
  else if (max === green) hue = (blue - red) / chroma + 2

  return `${(hue * 60).toFixed(3)} ${(saturation * 100).toFixed(3)}% ${(
    lightness * 100
  ).toFixed(3)}%`
}

export function storefrontThemeStyle(theme: StorefrontTheme): CSSProperties {
  const colors = theme.colors

  return {
    colorScheme: theme.scheme,
    "--background": hslChannels(colors.background),
    "--foreground": hslChannels(colors.foreground),
    "--card": hslChannels(colors.surface),
    "--card-foreground": "var(--foreground)",
    "--popover": "var(--card)",
    "--popover-foreground": "var(--foreground)",
    "--primary": hslChannels(colors.primary),
    "--primary-foreground": hslChannels(colors.primaryForeground),
    "--secondary": hslChannels(colors.secondary),
    "--secondary-foreground": "var(--foreground)",
    "--muted": hslChannels(colors.muted),
    "--muted-foreground": hslChannels(colors.mutedForeground),
    "--accent": hslChannels(colors.accent),
    "--accent-foreground": hslChannels(colors.accentForeground),
    "--border": hslChannels(colors.border),
    "--input": hslChannels(colors.input),
    "--ring": "var(--primary)",
    "--radius": `${theme.cornerRadius}px`,
    "--radius-md": "var(--radius)",
    "--storefront-radius-scale": theme.cornerRadius / 12,
    "--storefront-font": storefrontFonts[theme.fontFamily],
  } as CSSProperties
}

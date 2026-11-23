import { getBaseURL } from "@lib/util/env"
import { getStorefrontTheme } from "@lib/data/cms"
import { storefrontThemeStyle } from "@lib/storefront-theme"
import { Metadata } from "next"
import "@/styles/globals.css"
import CompareProvider from "@lib/context/compare-context"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const theme = await getStorefrontTheme()

  return (
    <html
      className={theme.scheme === "dark" ? "dark" : undefined}
      data-button-shape={theme.buttonShape}
      data-mode={theme.scheme}
      lang="ko"
      style={storefrontThemeStyle(theme)}
    >
      <head>
        <link rel="ucp" href="/.well-known/ucp" />
      </head>
      {/* Drawer 的 iOS 遮罩使用绝对定位，需要以 body 作为定位参照。 */}
      <body className="relative">
        <main className="relative">
          <CompareProvider>{props.children}</CompareProvider>
        </main>
      </body>
    </html>
  )
}

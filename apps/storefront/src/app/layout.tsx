import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "../styles/globals.css"
import CompareProvider from "@lib/context/compare-context"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="ko" data-mode="light">
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

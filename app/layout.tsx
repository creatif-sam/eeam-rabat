import type { Metadata } from "next"
import Script from "next/script"
import "./globals.css"
import ClientProviders from "@/components/ClientProviders"

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "EEAM Rabat - Église Évangélique Au Maroc",
  description:
    "La technologie et l'excellence pour la gloire de Dieu - Paroisse de Rabat",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EEAM Rabat"
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {}
}

export const viewport = {
  themeColor: "#ffffff"
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>

        <Script id="pwa-push" strategy="afterInteractive">
          {`
            if ("serviceWorker" in navigator) {
              window.addEventListener("load", function () {
                navigator.serviceWorker.register("/sw.js")
              })
            }
          `}
        </Script>
      </body>
    </html>
  )
}

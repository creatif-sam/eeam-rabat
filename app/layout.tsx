import type { Metadata } from "next"
import Script from "next/script"
import "./globals.css"
import ClientProviders from "@/components/ClientProviders"
import WhatsAppButton from "@/components/WhatsAppButton"

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000"

const siteTitle = "EEAM Rabat - Église Évangélique Au Maroc"
const siteDescription =
  "La technologie et l'excellence pour la gloire de Dieu - Paroisse de Rabat"

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: siteTitle,
  description: siteDescription,
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EEAM Rabat"
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: defaultUrl,
    siteName: "EEAM Rabat",
    locale: "fr_FR",
    type: "website",
    images: [{ url: "/images/eeam-logo.png" }]
  }
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

        <WhatsAppButton />

        <Script id="pwa-push" strategy="afterInteractive">
          {`
            if ("serviceWorker" in navigator) {
              window.addEventListener("load", function () {
                navigator.serviceWorker.register("/sw.js?v=${process.env.NEXT_PUBLIC_APP_VERSION || "dev"}")
              })
            }
          `}
        </Script>
      </body>
    </html>
  )
}

import type { Metadata, Viewport } from "next"
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
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }]
  },
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0891b2" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f17" }
  ]
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

        {/* Capture the install prompt before React hydrates (it only fires once) */}
        <Script id="pwa-install-capture" strategy="beforeInteractive">
          {`window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); window.__bip = e; });`}
        </Script>

        <Script id="pwa-sw" strategy="afterInteractive">
          {`
            (function () {
              if (!("serviceWorker" in navigator)) return;
              function register() {
                navigator.serviceWorker
                  .register("/sw.js?v=${process.env.NEXT_PUBLIC_APP_VERSION || "dev"}")
                  .catch(function (err) { console.warn("[sw] registration failed", err); });
              }
              // afterInteractive may run after "load" has already fired
              if (document.readyState === "complete") register();
              else window.addEventListener("load", register, { once: true });
            })();
          `}
        </Script>
      </body>
    </html>
  )
}

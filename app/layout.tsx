import type { Metadata, Viewport } from "next"
import Script from "next/script"
import { Suspense } from "react"
import "./globals.css"
import ClientProviders from "@/components/ClientProviders"
import WhatsAppButton from "@/components/WhatsAppButton"

// Production domain first, so shared links never point to a preview deployment
const defaultUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : null) ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")

const siteTitle = "EEAM Rabat - Église Évangélique Au Maroc"
const siteDescription =
  "La plateforme de la paroisse EEAM de Rabat : calendrier des cultes et activités, annonces, inscription des membres, demandes de prière, entretiens pastoraux et espace des responsables."
const shareImage = {
  url: "/images/og-eeam-rabat.jpg",
  width: 1200,
  height: 630,
  alt: "Le temple de l'Église Évangélique Au Maroc à Rabat"
}

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
    images: [shareImage]
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [shareImage.url]
  }
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#28868f" },
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

        <Suspense fallback={null}>
          <WhatsAppButton />
        </Suspense>

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

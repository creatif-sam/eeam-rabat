import type { Metadata } from "next"
import { ThemeProvider } from "next-themes"
import "./globals.css"
import CookieBanner from "@/components/CookieBanner"
import { CookieManager } from "@/components/CookieManager"
import PWAInstallPrompt from "@/components/PWAInstallPrompt"
import { viewport } from "./viewport"

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "EEAM Rabat - Église Évangélique Au Maroc",
  description: "La technologie et l'excellence pour la gloire de Dieu - Paroisse de Rabat",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EEAM Rabat",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "EEAM Rabat",
    title: "Église Évangélique Au Maroc - Paroisse de Rabat",
    description: "La technologie et l'excellence pour la gloire de Dieu",
  },
  twitter: {
    card: "summary_large_image",
    title: "EEAM Rabat",
    description: "Église Évangélique Au Maroc - Paroisse de Rabat",
  },
}

export { viewport }

export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/images/eeam-logo.png" />
        <link rel="apple-touch-icon" href="/images/eeam-logo.png" />
        <meta name="theme-color" content="#0891b2" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="EEAM Rabat" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <CookieManager />
          {children}
          <CookieBanner />
          <PWAInstallPrompt />
        </ThemeProvider>

        {/* PWA Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}

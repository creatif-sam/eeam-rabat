"use client"

import { ThemeProvider } from "next-themes"
import { useEffect, useState } from "react"
import CookieBanner from "@/components/CookieBanner"
import { CookieManager } from "@/components/CookieManager"
import PWAInstallPrompt from "@/components/PWAInstallPrompt"
import NormalizeBody from "@/components/NormalizeBody"

export default function ClientProviders({
  children
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <NormalizeBody />
      {children}
      <CookieManager />
      {mounted && <CookieBanner />}
      <PWAInstallPrompt />
    </ThemeProvider>
  )
}

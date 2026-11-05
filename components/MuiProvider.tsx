"use client"

import { useEffect } from "react"
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter"
import { ThemeProvider, useColorScheme } from "@mui/material/styles"
import { useTheme as useNextTheme } from "next-themes"
import theme from "@/lib/mui/theme"

/**
 * next-themes owns the light/dark choice for the whole site. This keeps
 * MUI's internal mode in step with it so both libraries always agree.
 */
function ColorSchemeSync() {
  const { resolvedTheme } = useNextTheme()
  const { setMode } = useColorScheme()

  useEffect(() => {
    if (resolvedTheme === "light" || resolvedTheme === "dark") {
      setMode(resolvedTheme)
    }
  }, [resolvedTheme, setMode])

  return null
}

export default function MuiProvider({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme} defaultMode="system" storageManager={null} disableTransitionOnChange>
        <ColorSchemeSync />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  )
}

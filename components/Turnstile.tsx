"use client"

import { useEffect, useImperativeHandle, useRef, type Ref } from "react"

// Cloudflare's official "always passes" test site key for local development.
const TEST_SITE_KEY = "1x00000000000000000000AA"
const SITE_KEY =
  process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || (process.env.NODE_ENV !== "production" ? TEST_SITE_KEY : "")
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string
  reset: (id: string) => void
  remove: (id: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

let scriptPromise: Promise<TurnstileApi> | null = null

function loadScript(): Promise<TurnstileApi> {
  if (typeof window !== "undefined" && window.turnstile) return Promise.resolve(window.turnstile)
  scriptPromise ??= new Promise((resolve, reject) => {
    const s = document.createElement("script")
    s.src = SCRIPT_SRC
    s.async = true
    s.defer = true
    s.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error("Turnstile unavailable")))
    s.onerror = () => {
      scriptPromise = null
      reject(new Error("Turnstile failed to load"))
    }
    document.head.appendChild(s)
  })
  return scriptPromise
}

export type TurnstileHandle = { reset: () => void }

/**
 * Cloudflare Turnstile widget. Calls onToken with a fresh token when the
 * visitor passes, and with null when it expires/errors/resets. Tokens are
 * single-use: call ref.reset() after every submission attempt.
 */
export default function Turnstile({
  onToken,
  ref,
  className = "",
}: {
  onToken: (token: string | null) => void
  ref?: Ref<TurnstileHandle>
  className?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | null>(null)
  const onTokenRef = useRef(onToken)
  onTokenRef.current = onToken

  useImperativeHandle(ref, () => ({
    reset: () => {
      onTokenRef.current(null)
      if (widgetId.current && window.turnstile) window.turnstile.reset(widgetId.current)
    },
  }))

  useEffect(() => {
    if (!SITE_KEY) {
      console.error("[turnstile] NEXT_PUBLIC_TURNSTILE_SITE_KEY / TURNSTILE_SITE_KEY is not set")
      return
    }
    let cancelled = false
    loadScript()
      .then((api) => {
        if (cancelled || !containerRef.current || widgetId.current) return
        widgetId.current = api.render(containerRef.current, {
          sitekey: SITE_KEY,
          theme: "auto",
          language: "fr",
          size: "flexible",
          callback: (t: string) => onTokenRef.current(t),
          "expired-callback": () => onTokenRef.current(null),
          "error-callback": () => onTokenRef.current(null),
        })
      })
      .catch((err) => console.error("[turnstile]", err))

    return () => {
      cancelled = true
      if (widgetId.current && window.turnstile) window.turnstile.remove(widgetId.current)
      widgetId.current = null
    }
  }, [])

  return <div ref={containerRef} className={`min-h-[65px] w-full ${className}`} />
}

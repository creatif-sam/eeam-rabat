"use client"

import { useSyncExternalStore } from "react"

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

declare global {
  interface Window {
    /** Captured by the inline script in app/layout.tsx before React loads. */
    __bip?: BeforeInstallPromptEvent | null
  }
}

export type InstallState = {
  /** Browser offered a native install prompt (Chrome, Edge, Samsung, Android…). */
  canPrompt: boolean
  /** iPhone / iPad: install only via Share → "Sur l'écran d'accueil". */
  isIOS: boolean
  /** Already running as an installed app. */
  isInstalled: boolean
}

const SERVER_STATE: InstallState = { canPrompt: false, isIOS: false, isInstalled: false }

let deferred: BeforeInstallPromptEvent | null = null
let state: InstallState = SERVER_STATE
let initialised = false
const listeners = new Set<() => void>()

function computeState(): InstallState {
  const nav = navigator as Navigator & { standalone?: boolean }
  const isInstalled = window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true
  const ua = navigator.userAgent
  const isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  return { canPrompt: !!deferred && !isInstalled, isIOS: isIOS && !isInstalled, isInstalled }
}

function emit() {
  state = computeState()
  listeners.forEach((l) => l())
}

function init() {
  if (initialised || typeof window === "undefined") return
  initialised = true
  deferred = window.__bip ?? null
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault()
    deferred = e as BeforeInstallPromptEvent
    window.__bip = deferred
    emit()
  })
  window.addEventListener("appinstalled", () => {
    deferred = null
    window.__bip = null
    emit()
  })
  window.matchMedia("(display-mode: standalone)").addEventListener?.("change", emit)
  state = computeState()
}

function subscribe(listener: () => void) {
  init()
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Triggers the native install prompt. Returns true when the user accepted. */
export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false
  const event = deferred
  deferred = null
  window.__bip = null
  try {
    await event.prompt()
    const { outcome } = await event.userChoice
    return outcome === "accepted"
  } catch {
    return false
  } finally {
    emit()
  }
}

export function usePWAInstall(): InstallState {
  return useSyncExternalStore(
    subscribe,
    () => {
      init()
      return state
    },
    () => SERVER_STATE
  )
}

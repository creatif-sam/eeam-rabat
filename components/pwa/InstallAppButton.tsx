"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Download, PlusSquare, Share, Smartphone, X } from "lucide-react"
import { promptInstall, usePWAInstall } from "@/lib/pwa/install"

type Variant = "header" | "card"

/** Step-by-step instructions for iPhone/iPad, which have no install prompt. */
export function IOSInstructions({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ios-install-title"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl bg-white dark:bg-gray-900 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl"
      >
        <button onClick={onClose} aria-label="Fermer" className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
          <X size={18} />
        </button>
        <div className="flex items-center gap-3">
          <Image src="/icons/icon-192.png" alt="" width={48} height={48} className="rounded-xl border border-gray-100 dark:border-gray-800" />
          <div>
            <h2 id="ios-install-title" className="font-bold text-gray-900 dark:text-white">Installer EEAM Rabat</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Sur votre iPhone ou iPad</p>
          </div>
        </div>
        <ol className="mt-5 space-y-3 text-sm text-gray-700 dark:text-gray-200">
          <li className="flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-50 font-bold text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">1</span>
            <span>
              Touchez <Share size={15} className="inline -mt-0.5 text-cyan-600" /> <strong>Partager</strong> dans la barre de Safari
            </span>
          </li>
          <li className="flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-50 font-bold text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">2</span>
            <span>
              Choisissez <PlusSquare size={15} className="inline -mt-0.5 text-cyan-600" /> <strong>Sur l&apos;écran d&apos;accueil</strong>
            </span>
          </li>
          <li className="flex items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-50 font-bold text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">3</span>
            <span>
              Touchez <strong>Ajouter</strong> : l&apos;icône apparaît sur votre écran
            </span>
          </li>
        </ol>
        <button onClick={onClose} className="mt-6 w-full rounded-xl bg-cyan-600 py-3 text-sm font-semibold text-white hover:bg-cyan-700">
          J&apos;ai compris
        </button>
      </div>
    </div>
  )
}

/**
 * "Install the app" button. Renders nothing when the app is already
 * installed or the browser can't install it.
 */
export default function InstallAppButton({ variant = "header" }: { variant?: Variant }) {
  const { canPrompt, isIOS } = usePWAInstall()
  const [showIOS, setShowIOS] = useState(false)

  if (!canPrompt && !isIOS) return null

  const onClick = () => (canPrompt ? void promptInstall() : setShowIOS(true))

  return (
    <>
      {variant === "header" ? (
        <button
          onClick={onClick}
          aria-label="Installer l'application"
          title="Installer l'application"
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-3 lg:px-4 text-gray-700 dark:text-gray-200 shadow-sm hover:border-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition"
        >
          <Download size={20} />
          <span className="hidden lg:inline text-sm font-medium">Installer l&apos;app</span>
        </button>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-br from-cyan-600/20 to-blue-700/20 p-5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-cyan-300">
            <Smartphone size={24} />
          </span>
          <div className="flex-1">
            <p className="font-semibold text-white">L&apos;application EEAM Rabat</p>
            <p className="text-sm text-gray-400">Calendrier, annonces et formulaires en un geste depuis votre écran d&apos;accueil.</p>
          </div>
          <button
            onClick={onClick}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-400 transition shrink-0"
          >
            <Download size={16} /> Installer
          </button>
        </div>
      )}
      {showIOS && <IOSInstructions onClose={() => setShowIOS(false)} />}
    </>
  )
}

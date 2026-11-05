"use client"

import { useEffect, useState } from "react"
import {
  BadgeCheck,
  CalendarDays,
  Check,
  Church,
  Clock,
  Copy,
  History,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
  X,
} from "lucide-react"
import { getUserDetails, type UserDetails } from "@/app/dashboard/users/actions"

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  pastor: "Pasteur",
  corps_pastoral: "Pasteur",
  treasurer: "Trésorier",
  cp: "Membre CP",
  membre_cp: "Membre CP",
  president_cp: "Membre CP",
}

const fmt = (iso: string | null, withTime = false) =>
  iso
    ? new Date(iso).toLocaleString("fr-FR", withTime ? { dateStyle: "long", timeStyle: "short" } : { dateStyle: "long" })
    : "—"

function waLink(phone: string) {
  let d = phone.replace(/[^\d+]/g, "")
  if (d.startsWith("+")) d = d.slice(1)
  else if (d.startsWith("00")) d = d.slice(2)
  else if (d.startsWith("0") && d.length === 10) d = "212" + d.slice(1)
  return `https://wa.me/${d}`
}

function Row({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5">
      <Icon size={16} className="mt-0.5 shrink-0 text-gray-400" />
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wide text-gray-400">{label}</p>
        <div className="text-sm text-gray-900 dark:text-gray-100 break-words">{children}</div>
      </div>
    </div>
  )
}

export default function UserDetailsDialog({ userId, onClose }: { userId: string | null; onClose: () => void }) {
  const [data, setData] = useState<UserDetails | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!userId) return
    setData(null)
    setError(null)
    setCopied(false)
    let cancelled = false
    getUserDetails(userId).then((r) => {
      if (cancelled) return
      if (r.ok) setData(r.data)
      else setError(r.error)
    })
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => {
      cancelled = true
      window.removeEventListener("keydown", onKey)
    }
  }, [userId, onClose])

  if (!userId) return null

  const name = data?.full_name || data?.email || "Utilisateur"
  const initials = name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase()
  const privileged = ["admin", "pastor", "corps_pastoral", "treasurer"].includes((data?.role ?? "").toLowerCase())

  async function copyEmail() {
    if (!data?.email) return
    try {
      await navigator.clipboard.writeText(data.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Détails de ${name}`}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl"
      >
        <div className="relative h-20 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700">
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="absolute right-3 top-3 rounded-lg p-1.5 text-white/80 hover:bg-white/15 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {!data && !error ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-500">
            <Loader2 size={18} className="animate-spin" /> Chargement…
          </div>
        ) : error ? (
          <p className="px-6 py-12 text-center text-sm text-rose-600 dark:text-rose-400">{error}</p>
        ) : (
          data && (
            <div className="px-6 pb-6">
              <div className="-mt-10 flex items-end gap-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-white dark:border-gray-900 bg-cyan-600 text-white grid place-items-center text-2xl font-bold shadow">
                  {data.avatar_url ? <img src={data.avatar_url} alt="" className="h-full w-full object-cover" /> : initials}
                </div>
                <div className="min-w-0 pb-1">
                  <h2 className="truncate text-lg font-bold text-gray-900 dark:text-white">{name}</h2>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-xs font-medium text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                      {ROLE_LABELS[(data.role ?? "").toLowerCase()] ?? "Utilisateur"}
                    </span>
                    {privileged || data.approved ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                        <ShieldCheck size={12} /> Approuvé
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                        <Clock size={12} /> En attente
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 divide-y divide-gray-100 dark:divide-gray-800">
                <Row icon={Mail} label="Adresse e-mail">
                  {data.email ? (
                    <span className="flex items-center gap-2">
                      <a href={`mailto:${data.email}`} className="text-cyan-700 dark:text-cyan-400 hover:underline break-all">
                        {data.email}
                      </a>
                      <button
                        onClick={copyEmail}
                        title="Copier l'adresse"
                        aria-label="Copier l'adresse e-mail"
                        className="shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800"
                      >
                        {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                      </button>
                    </span>
                  ) : (
                    "—"
                  )}
                  {data.email_confirmed_at === null && data.email && (
                    <span className="block text-xs text-amber-600 dark:text-amber-400">Adresse non confirmée</span>
                  )}
                </Row>
                <Row icon={Phone} label="Téléphone">
                  {data.phone ? (
                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <a href={`tel:${data.phone.replace(/\s/g, "")}`} className="hover:underline">
                        {data.phone}
                      </a>
                      <a
                        href={waLink(data.phone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 hover:underline"
                      >
                        <MessageCircle size={13} /> WhatsApp
                      </a>
                    </span>
                  ) : (
                    "—"
                  )}
                </Row>
                <Row icon={Church} label="Église">{data.church || "—"}</Row>
                <Row icon={BadgeCheck} label="Profil">{data.completed ? "Complet" : "Incomplet"}</Row>
                <Row icon={CalendarDays} label="Inscrit le">{fmt(data.created_at)}</Row>
                <Row icon={History} label="Dernière connexion">{fmt(data.last_sign_in_at, true)}</Row>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}

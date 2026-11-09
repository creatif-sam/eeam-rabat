"use client"

import { useEffect, useRef, useState } from "react"
import { AlertTriangle, Check, Copy, KeyRound, Loader2, MailCheck, ShieldCheck, UserPlus, X } from "lucide-react"
import { toast } from "sonner"
import { grantAccess, type GrantAccessResult } from "@/app/dashboard/users/actions"

const ROLE_OPTIONS = [
  { value: "membre_cp", label: "Membre CP" },
  { value: "pastor", label: "Pasteur" },
  { value: "treasurer", label: "Trésorier" },
  { value: "admin", label: "Administrateur" },
]

export type IssuedPassword = {
  email: string
  fullName: string | null
  tempPassword: string
  isNew: boolean
  /** true = emailed, false = email failed, null = not requested */
  emailed: boolean | null
}

function EmailPasswordCheckbox({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-start gap-2.5 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 accent-cyan-600" />
      <span>
        Envoyer le mot de passe temporaire par e-mail
        <span className="block text-xs text-gray-500 dark:text-gray-400">Vous pourrez aussi le copier à l&apos;étape suivante.</span>
      </span>
    </label>
  )
}

type NewProfile = Extract<GrantAccessResult, { ok: true }>["profile"]

const inputCls =
  "w-full rounded-lg border bg-white dark:bg-gray-950 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 outline-none transition-colors " +
  "border-gray-300 dark:border-gray-700 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"

function shell(children: React.ReactNode, onClose: () => void, busy: boolean, labelledBy: string) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4"
      onClick={() => !busy && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden"
      >
        {children}
      </div>
    </div>
  )
}

function Header({ id, icon, title, subtitle, onClose, busy }: { id: string; icon: React.ReactNode; title: string; subtitle: string; onClose: () => void; busy: boolean }) {
  return (
    <div className="flex items-start justify-between gap-3 p-5 border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-start gap-3">
        <div className="shrink-0 rounded-full bg-cyan-50 dark:bg-cyan-900/30 p-2 text-cyan-600 dark:text-cyan-400">{icon}</div>
        <div>
          <h2 id={id} className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
      </div>
      <button type="button" onClick={onClose} disabled={busy} aria-label="Fermer" className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40">
        <X size={18} />
      </button>
    </div>
  )
}

/** Asks before replacing someone's password with a new temporary one. */
export function ConfirmResetDialog({
  target,
  busy,
  onCancel,
  onConfirm,
}: {
  target: { full_name: string | null; email: string | null } | null
  busy: boolean
  onCancel: () => void
  onConfirm: (emailPassword: boolean) => void
}) {
  const [emailIt, setEmailIt] = useState(true)

  useEffect(() => {
    if (!target) return
    setEmailIt(true)
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onCancel()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [target, busy, onCancel])

  if (!target) return null
  const who = target.full_name ?? target.email ?? "cette personne"

  return shell(
    <>
      <Header
        id="confirm-reset-title"
        icon={<KeyRound size={18} />}
        title="Nouveau mot de passe temporaire"
        subtitle={who}
        onClose={onCancel}
        busy={busy}
      />
      <div className="p-5 space-y-4">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Son mot de passe actuel ne fonctionnera plus. Un mot de passe temporaire sera généré, et il devra en choisir un nouveau à la connexion.
        </p>
        <EmailPasswordCheckbox checked={emailIt} onChange={setEmailIt} />
        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <button type="button" onClick={onCancel} disabled={busy} className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40">
            Annuler
          </button>
          <button
            type="button"
            autoFocus
            onClick={() => onConfirm(emailIt)}
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-50"
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
            Générer
          </button>
        </div>
      </div>
    </>,
    onCancel,
    busy,
    "confirm-reset-title"
  )
}

/** Shows a one-time password once, with copy helpers. */
export function TempPasswordReveal({ issued, onClose }: { issued: IssuedPassword | null; onClose: () => void }) {
  const [copied, setCopied] = useState<"password" | "message" | null>(null)

  useEffect(() => {
    if (!issued) return
    setCopied(null)
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [issued, onClose])

  if (!issued) return null

  const loginUrl = `${window.location.origin}/auth/login`
  const message =
    `Bonjour${issued.fullName ? ` ${issued.fullName}` : ""},\n\n` +
    `${issued.isNew ? "Votre accès à l'intranet EEAM Rabat est prêt." : "Voici un nouveau mot de passe temporaire pour l'intranet EEAM Rabat."}\n` +
    `Lien : ${loginUrl}\n` +
    `E-mail : ${issued.email}\n` +
    `Mot de passe temporaire : ${issued.tempPassword}\n\n` +
    `À la connexion, vous choisirez votre propre mot de passe.`

  async function copy(kind: "password" | "message") {
    try {
      await navigator.clipboard.writeText(kind === "password" ? issued!.tempPassword : message)
      setCopied(kind)
      toast.success(kind === "password" ? "Mot de passe copié." : "Message copié, prêt à envoyer.")
    } catch {
      toast.error("Copie impossible : sélectionnez le texte manuellement.")
    }
  }

  return shell(
    <>
      <Header
        id="temp-password-title"
        icon={<ShieldCheck size={18} />}
        title={issued.isNew ? "Accès créé" : "Nouveau mot de passe temporaire"}
        subtitle={issued.email}
        onClose={onClose}
        busy={false}
      />
      <div className="p-5 space-y-4">
        {issued.emailed === true && (
          <p className="flex items-start gap-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-3 py-2.5 text-sm text-emerald-800 dark:text-emerald-300">
            <MailCheck size={18} className="shrink-0 mt-px" />
            <span>Le mot de passe temporaire a été envoyé par e-mail à <strong>{issued.email}</strong>.</span>
          </p>
        )}
        {issued.emailed === false && (
          <p className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 px-3 py-2.5 text-sm text-red-800 dark:text-red-300">
            <AlertTriangle size={18} className="shrink-0 mt-px" />
            <span>L&apos;e-mail n&apos;a pas pu être envoyé. Copiez le mot de passe ci-dessous et transmettez-le vous-même.</span>
          </p>
        )}

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5">Mot de passe temporaire</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 select-all rounded-lg bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 px-3 py-2.5 font-mono text-lg tracking-wider text-gray-900 dark:text-white">
              {issued.tempPassword}
            </code>
            <button
              type="button"
              onClick={() => void copy("password")}
              aria-label="Copier le mot de passe"
              className="shrink-0 rounded-lg border border-gray-200 dark:border-gray-700 p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {copied === "password" ? <Check size={18} className="text-emerald-600" /> : <Copy size={18} />}
            </button>
          </div>
        </div>

        <p className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-3 py-2.5 text-sm text-amber-800 dark:text-amber-300">
          {issued.emailed
            ? "Ce mot de passe ne sera plus affiché ici. Copiez-le si vous voulez aussi l'envoyer autrement (WhatsApp, SMS). La personne devra le changer dès sa première connexion."
            : "Ce mot de passe ne sera plus affiché. Transmettez-le en privé (WhatsApp, SMS, de vive voix). La personne devra le changer dès sa première connexion."}
        </p>

        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
            Terminé
          </button>
          <button
            type="button"
            onClick={() => void copy("message")}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700"
          >
            {copied === "message" ? <Check size={16} /> : <Copy size={16} />}
            Copier le message à envoyer
          </button>
        </div>
      </div>
    </>,
    onClose,
    false,
    "temp-password-title"
  )
}

/** Form to give someone access. On success the parent shows the one-time password. */
export default function GrantAccessDialog({
  open,
  onClose,
  onGranted,
}: {
  open: boolean
  onClose: () => void
  onGranted: (profile: NewProfile, issued: IssuedPassword) => void
}) {
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState("membre_cp")
  const [welcome, setWelcome] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const emailInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setEmail("")
    setFullName("")
    setRole("membre_cp")
    setWelcome(true)
    setError(null)
    setSaving(false)
    const t = setTimeout(() => emailInput.current?.focus(), 50)
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", onKey)
    return () => {
      clearTimeout(t)
      window.removeEventListener("keydown", onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  if (!open) return null

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (saving) return
    setSaving(true)
    setError(null)
    const result = await grantAccess({ email, fullName, role, emailPassword: welcome })
    setSaving(false)
    if (!result.ok) return setError(result.error)
    onGranted(result.profile, {
      email: result.profile.email,
      fullName: result.profile.full_name,
      tempPassword: result.tempPassword,
      isNew: true,
      emailed: welcome ? result.emailSent : null,
    })
  }

  return shell(
    <form onSubmit={submit}>
      <Header
        id="grant-access-title"
        icon={<UserPlus size={18} />}
        title="Donner un accès"
        subtitle="Un mot de passe temporaire sera généré."
        onClose={onClose}
        busy={saving}
      />
      <div className="p-5 space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="grant-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Adresse e-mail</label>
          <input
            ref={emailInput}
            id="grant-email"
            type="email"
            required
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="prenom.nom@exemple.com"
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="grant-name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Nom complet <span className="font-normal text-gray-400">(facultatif)</span>
          </label>
          <input id="grant-name" autoComplete="off" value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="grant-role" className="text-sm font-medium text-gray-700 dark:text-gray-300">Rôle</label>
          <select id="grant-role" value={role} onChange={(e) => setRole(e.target.value)} className={inputCls}>
            {ROLE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <EmailPasswordCheckbox checked={welcome} onChange={setWelcome} />

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end pt-1">
          <button type="button" onClick={onClose} disabled={saving} className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40">
            Annuler
          </button>
          <button
            type="submit"
            disabled={saving || !email.trim()}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
            Créer l&apos;accès
          </button>
        </div>
      </div>
    </form>,
    onClose,
    saving,
    "grant-access-title"
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import { AlertTriangle, Loader2, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { deleteUserAccount } from "@/app/dashboard/users/actions"
import { DELETE_PHRASE, deletionName } from "@/lib/accounts/delete"

type Target = { id: string; full_name: string | null; email: string | null }

/**
 * Vercel-style confirmation: the administrator must retype the person's
 * name exactly, then the confirmation phrase, before deletion is enabled.
 */
export default function DeleteAccountDialog({
  target,
  onClose,
  onDeleted,
}: {
  target: Target | null
  onClose: () => void
  onDeleted: (id: string) => void
}) {
  const [typedName, setTypedName] = useState("")
  const [typedPhrase, setTypedPhrase] = useState("")
  const [deleting, setDeleting] = useState(false)
  const nameInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!target) return
    setTypedName("")
    setTypedPhrase("")
    setDeleting(false)
    const t = setTimeout(() => nameInput.current?.focus(), 50)
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !deleting && onClose()
    window.addEventListener("keydown", onKey)
    return () => {
      clearTimeout(t)
      window.removeEventListener("keydown", onKey)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target])

  if (!target) return null

  const expectedName = deletionName(target)
  const nameOk = typedName.trim() === expectedName
  const phraseOk = typedPhrase.trim().toLowerCase() === DELETE_PHRASE
  const canDelete = nameOk && phraseOk && !deleting

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!canDelete || !target) return
    setDeleting(true)
    const result = await deleteUserAccount(target.id, typedName, typedPhrase)
    setDeleting(false)
    if (!result.ok) return toast.error(result.error)
    toast.success(`Le compte de ${expectedName} a été supprimé.`)
    onDeleted(target.id)
    onClose()
  }

  const inputCls =
    "w-full rounded-lg border bg-white dark:bg-gray-950 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 outline-none transition-colors " +
    "border-gray-300 dark:border-gray-700 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4"
      onClick={() => !deleting && onClose()}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-account-title"
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden"
      >
        <div className="flex items-start justify-between gap-3 p-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400">
              <AlertTriangle size={18} />
            </span>
            <div>
              <h2 id="delete-account-title" className="font-semibold text-gray-900 dark:text-white">
                Supprimer le compte
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{target.email ?? expectedName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            aria-label="Fermer"
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-900/50 px-3 py-2.5 text-sm text-rose-800 dark:text-rose-300">
            Cette action est <strong>définitive</strong>. Le compte, le profil et la photo de cette personne seront supprimés ;
            elle ne pourra plus se connecter.
          </p>

          <div className="space-y-1.5">
            <label htmlFor="confirm-name" className="block text-sm text-gray-700 dark:text-gray-300">
              Saisissez le nom <strong className="font-semibold text-gray-900 dark:text-white select-all">{expectedName}</strong> pour continuer :
            </label>
            <input
              id="confirm-name"
              ref={nameInput}
              value={typedName}
              onChange={(e) => setTypedName(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              className={inputCls}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirm-phrase" className="block text-sm text-gray-700 dark:text-gray-300">
              Pour confirmer, saisissez <strong className="font-semibold text-gray-900 dark:text-white select-all">{DELETE_PHRASE}</strong> ci-dessous :
            </label>
            <input
              id="confirm-phrase"
              value={typedPhrase}
              onChange={(e) => setTypedPhrase(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              className={inputCls}
            />
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 px-5 py-4 bg-gray-50 dark:bg-gray-950/40 border-t border-gray-100 dark:border-gray-800">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={!canDelete}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            Supprimer définitivement
          </button>
        </div>
      </form>
    </div>
  )
}

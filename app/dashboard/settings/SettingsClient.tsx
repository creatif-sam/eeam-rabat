"use client"

import { useState } from "react"
import { Shield, Save, Eye, EyeOff, Settings } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

const PRIVILEGED_ROLES = ["admin", "pastor"]

export default function SettingsClient({
  role,
  initialSettings
}: {
  role: string | null
  initialSettings: Record<string, string>
}) {
  const supabase = createClient()
  const isPrivileged = role != null && PRIVILEGED_ROLES.includes(role)

  const [attendancePassword, setAttendancePassword] = useState(
    initialSettings["attendance_form_password"] ?? ""
  )
  const [responsablePassword, setResponsablePassword] = useState(
    initialSettings["responsable_form_password"] ?? ""
  )
  const [showAttendance, setShowAttendance] = useState(false)
  const [showResponsable, setShowResponsable] = useState(false)
  const [saving, setSaving] = useState(false)

  const savePasswords = async () => {
    setSaving(true)
    try {
      const updates = [
        { key: "attendance_form_password", value: attendancePassword },
        { key: "responsable_form_password", value: responsablePassword }
      ]

      const { error } = await supabase
        .from("app_settings")
        .upsert(updates, { onConflict: "key" })

      if (error) {
        toast.error(
          "Impossible de sauvegarder. Assurez-vous que la table app_settings existe dans Supabase."
        )
      } else {
        toast.success("Mots de passe sauvegardés avec succès.")
      }
    } catch {
      toast.error("Une erreur inattendue est survenue.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Paramètres
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Configuration et sécurité de l'application
        </p>
      </div>

      {isPrivileged ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          {/* Tab header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
              <Shield size={18} className="text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Sécurité des formulaires
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Définissez les mots de passe d'accès aux formulaires publics
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Attendance form password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Mot de passe — Formulaire d'assiduité aux cultes
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Requis pour accéder au formulaire de suivi des présences.
              </p>
              <div className="relative max-w-sm">
                <input
                  type={showAttendance ? "text" : "password"}
                  value={attendancePassword}
                  onChange={e => setAttendancePassword(e.target.value)}
                  placeholder="Définir un mot de passe..."
                  className="w-full pr-10 pl-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowAttendance(v => !v)}
                  aria-label={showAttendance ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showAttendance ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Responsable form password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Mot de passe — Requêtes de responsables
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                Requis pour soumettre une requête de responsable de commission.
              </p>
              <div className="relative max-w-sm">
                <input
                  type={showResponsable ? "text" : "password"}
                  value={responsablePassword}
                  onChange={e => setResponsablePassword(e.target.value)}
                  placeholder="Définir un mot de passe..."
                  className="w-full pr-10 pl-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowResponsable(v => !v)}
                  aria-label={showResponsable ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showResponsable ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Save button */}
            <div className="pt-2">
              <button
                onClick={savePasswords}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-cyan-500/25 text-sm"
              >
                <Save size={16} />
                {saving ? "Enregistrement..." : "Enregistrer les mots de passe"}
              </button>
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <Settings size={28} className="text-gray-400 dark:text-gray-500" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Aucun paramètre disponible pour votre rôle.
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Contactez un administrateur ou un pasteur.
          </p>
        </div>
      )}
    </div>
  )
}

"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Camera, Save, Upload, UserRound } from "lucide-react"
import { toast } from "sonner"

type Profile = {
  id: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
  role?: string | null
  church?: string | null
}

function formatRole(role?: string | null) {
  if (!role) return "Utilisateur"

  const map: Record<string, string> = {
    admin: "Administrateur",
    pastor: "Pasteur",
    treasurer: "Trésorier",
    cp: "Membre CP",
    membre_cp: "Membre CP",
    president_cp: "Membre CP",
    corps_pastoral: "Pasteur"
  }

  return map[role] ?? role
}

export default function ProfileForm({
  profile,
  email
}: {
  profile: Profile
  email: string
}) {
  const supabase = createClient()

  const [fullName, setFullName] = useState(profile.full_name ?? "")
  const [phone, setPhone] = useState(profile.phone ?? "")
  const [church, setChurch] = useState(profile.church ?? "EEAM Rabat")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)

  const initials = useMemo(() => {
    const base = (fullName || email || "Utilisateur").trim()
    return base
      .split(" ")
      .filter(Boolean)
      .map(chunk => chunk[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }, [email, fullName])

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  function onAvatarChange(file: File | null) {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setAvatarFile(file)

    if (!file) {
      setPreviewUrl(null)
      return
    }

    setPreviewUrl(URL.createObjectURL(file))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    let avatarUrl = profile.avatar_url

    if (avatarFile) {
      const fileExt = avatarFile.name.split(".").pop()
      const filePath = `${profile.id}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, {
          upsert: true
        })

      if (uploadError) {
        toast.error("Impossible de téléverser la photo de profil.")
      } else {
        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath)

        avatarUrl = data.publicUrl
      }
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone,
        church,
        avatar_url: avatarUrl
      })
      .eq("id", profile.id)

    if (error) {
      toast.error("Échec de la mise à jour du profil.")
      setSaving(false)
      return
    }

    setSaving(false)
    toast.success("Profil mis à jour avec succès")
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-6">
      <section className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm h-fit">
        <div className="flex flex-col items-center text-center">
          <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl">
            {previewUrl ? (
              <img src={previewUrl} alt="Aperçu" className="w-full h-full object-cover" />
            ) : profile.avatar_url ? (
              <img src={profile.avatar_url} alt={fullName || "Avatar"} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
            <div className="absolute right-1 bottom-1 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center">
              <Camera size={14} />
            </div>
          </div>

          <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-gray-100">{fullName || "Utilisateur"}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{email || "Email indisponible"}</p>

          <span className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border border-cyan-100 dark:border-cyan-800">
            {formatRole(profile.role)}
          </span>
        </div>
      </section>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 md:p-8 shadow-sm space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom complet</label>
            <input
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-3 rounded-xl"
              placeholder="Nom complet"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
            <input
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-3 rounded-xl"
              placeholder="Téléphone"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <div className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950/60 text-gray-700 dark:text-gray-300 p-3 rounded-xl">
              {email || "Email indisponible"}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Église locale</label>
            <input
              value={church}
              onChange={e => setChurch(e.target.value)}
              className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 p-3 rounded-xl"
              placeholder="Église locale"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Photo de profil</label>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <Upload size={16} />
              Choisir une image
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={e => onAvatarChange(e.target.files?.[0] ?? null)}
              />
            </label>

            {avatarFile && (
              <button
                type="button"
                onClick={() => onAvatarChange(null)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <UserRound size={16} />
                Retirer l’aperçu
              </button>
            )}
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium shadow-lg shadow-cyan-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Save size={16} />
            {saving ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
      </form>
    </div>
  )
}

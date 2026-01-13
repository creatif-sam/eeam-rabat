"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle, Upload } from "lucide-react"

type Profile = {
  id: string
  full_name: string | null
  phone: string | null
  avatar_url: string | null
}

export default function ProfileForm({ profile }: { profile: Profile }) {
  const supabase = createClient()

  const [fullName, setFullName] = useState(profile.full_name ?? "")
  const [phone, setPhone] = useState(profile.phone ?? "")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

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

      if (!uploadError) {
        const { data } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath)

        avatarUrl = data.publicUrl
      }
    }

    await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone,
        avatar_url: avatarUrl
      })
      .eq("id", profile.id)

    setSaving(false)
    setSuccess(true)

    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl space-y-6 bg-white p-6 rounded-2xl shadow"
    >
      <h1 className="text-2xl font-bold">Mon profil</h1>

      {/* Success popup */}
      {success && (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3 text-green-700">
          <CheckCircle size={18} />
          Profil mis à jour avec succès
        </div>
      )}

      <input
        value={fullName}
        onChange={e => setFullName(e.target.value)}
        className="w-full border p-3 rounded"
        placeholder="Nom complet"
        required
      />

      <input
        value={phone}
        onChange={e => setPhone(e.target.value)}
        className="w-full border p-3 rounded"
        placeholder="Téléphone"
      />

      {/* Avatar preview */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border">
          {profile.avatar_url && !avatarFile && (
            <img
              src={profile.avatar_url}
              className="w-full h-full object-cover"
            />
          )}
          {avatarFile && (
            <img
              src={URL.createObjectURL(avatarFile)}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <label className="cursor-pointer flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
          <Upload size={16} />
          Changer la photo
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={e => setAvatarFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <button
        disabled={saving}
        className="bg-cyan-600 text-white px-6 py-3 rounded-lg w-full"
      >
        {saving ? "Enregistrement..." : "Enregistrer"}
      </button>
    </form>
  )
}

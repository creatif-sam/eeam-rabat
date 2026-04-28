"use client"

import { useMemo, useState } from "react"
import { ShieldAlert, ShieldCheck, UsersRound, Search, CheckCircle, XCircle, Clock } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

type ProfileRecord = {
  id: string
  full_name: string | null
  email: string | null
  role: string | null
  church: string | null
  completed: boolean | null
  approved: boolean | null
  created_at: string | null
}

type UsersAdminPanelProps = {
  currentUserId: string
  currentUserRole: string | null
  profiles: ProfileRecord[]
}

const ROLE_OPTIONS = [
  { value: "admin", label: "Administrateur" },
  { value: "pastor", label: "Pasteur" },
  { value: "membre_cp", label: "Membre CP" },
  { value: "treasurer", label: "Trésorier" }
]

function normalizeRole(role: string | null) {
  if (role === "cp") return "membre_cp"
  if (role === "president_cp") return "membre_cp"
  if (role === "corps_pastoral") return "pastor"
  return role
}

function formatRole(role: string | null) {
  const normalizedRole = normalizeRole(role)
  return ROLE_OPTIONS.find(option => option.value === normalizedRole)?.label ?? "Utilisateur"
}

export default function UsersAdminPanel({
  currentUserId,
  currentUserRole,
  profiles: initialProfiles
}: UsersAdminPanelProps) {
  const supabase = createClient()
  const [profiles, setProfiles] = useState(initialProfiles)
  const [search, setSearch] = useState("")
  const [savingId, setSavingId] = useState<string | null>(null)

  const canManageRoles = normalizeRole(currentUserRole) === "admin"
  const canApprove = ["admin", "pastor"].includes(normalizeRole(currentUserRole) ?? "")

  const filteredProfiles = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return profiles

    return profiles.filter(profile => {
      const haystack = [
        profile.full_name,
        profile.email,
        profile.church,
        formatRole(profile.role),
        profile.role
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return haystack.includes(term)
    })
  }, [profiles, search])

  async function handleApproval(profileId: string, approve: boolean) {
    if (!canApprove) return
    setSavingId(profileId)

    const { error } = await supabase
      .from("profiles")
      .update({ approved: approve })
      .eq("id", profileId)

    if (error) {
      toast.error("Impossible de modifier l'approbation.")
      setSavingId(null)
      return
    }

    setProfiles(prev =>
      prev.map(p => p.id === profileId ? { ...p, approved: approve } : p)
    )

    const target = profiles.find(p => p.id === profileId)
    await supabase.from("activity_logs").insert({
      actor_user_id: currentUserId,
      action: approve ? "user_approved" : "user_rejected",
      entity_type: "profiles",
      entity_id: profileId,
      description: `${approve ? "Approved" : "Rejected"} access for ${target?.full_name ?? target?.email ?? profileId}`,
      metadata: { target_user_id: profileId }
    })

    toast.success(approve ? "Utilisateur approuvé." : "Accès révoqué.")
    setSavingId(null)
  }

  const stats = useMemo(() => {
    const admins = profiles.filter(profile => normalizeRole(profile.role) === "admin").length
    const configured = profiles.filter(profile => profile.completed).length
    const pending = profiles.filter(profile =>
      !profile.approved &&
      !(["admin", "pastor", "corps_pastoral"].includes(profile.role ?? ""))
    ).length

    return {
      total: profiles.length,
      admins,
      configured,
      pending
    }
  }, [profiles])

  async function handleRoleChange(profileId: string, nextRole: string) {
    if (!canManageRoles) return

    const currentProfile = profiles.find(profile => profile.id === profileId)
    if (!currentProfile) return

    const previousRole = normalizeRole(currentProfile.role)
    if (previousRole === nextRole) return

    setSavingId(profileId)

    const { error } = await supabase
      .from("profiles")
      .update({ role: nextRole })
      .eq("id", profileId)

    if (error) {
      toast.error("Impossible de modifier le rôle.")
      setSavingId(null)
      return
    }

    setProfiles(currentProfiles =>
      currentProfiles.map(profile =>
        profile.id === profileId ? { ...profile, role: nextRole } : profile
      )
    )

    await supabase.from("activity_logs").insert({
      actor_user_id: currentUserId,
      action: "role_updated",
      entity_type: "profiles",
      entity_id: profileId,
      description: `Role changed from ${previousRole ?? "none"} to ${nextRole} for ${currentProfile.full_name ?? currentProfile.email ?? profileId}`,
      metadata: {
        previous_role: previousRole,
        next_role: nextRole,
        target_user_id: profileId
      }
    })

    toast.success("Rôle mis à jour.")
    setSavingId(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Utilisateurs
        </h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
          Vue d'ensemble des profils. Les administrateurs peuvent modifier les rôles.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Utilisateurs</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Administrateurs</p>
          <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{stats.admins}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Profils complétés</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.configured}</p>
        </div>
        <div className={`rounded-xl border p-4 ${
          stats.pending > 0
            ? "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800"
            : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800"
        }`}>
          <p className="text-sm text-gray-500 dark:text-gray-400">En attente</p>
          <p className={`text-2xl font-bold ${
            stats.pending > 0 ? "text-amber-600 dark:text-amber-400" : "text-gray-900 dark:text-white"
          }`}>{stats.pending}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="relative w-full md:max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Rechercher un utilisateur..."
              className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 pl-9 pr-3 py-2 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-cyan-400"
            />
          </div>

          <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
            canManageRoles
              ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
              : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
          }`}>
            {canManageRoles ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
            <span>
              {canManageRoles ? "Mode administrateur actif" : "Consultation uniquement, modification réservée aux administrateurs"}
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="p-3 text-left text-gray-700 dark:text-gray-300">Nom</th>
                <th className="p-3 text-left text-gray-700 dark:text-gray-300">Email</th>
                <th className="p-3 text-left text-gray-700 dark:text-gray-300 hidden md:table-cell">Église</th>
                <th className="p-3 text-left text-gray-700 dark:text-gray-300">Rôle</th>
                <th className="p-3 text-left text-gray-700 dark:text-gray-300">Accès</th>
                <th className="p-3 text-left text-gray-700 dark:text-gray-300 hidden lg:table-cell">Statut</th>
                <th className="p-3 text-left text-gray-700 dark:text-gray-300 hidden lg:table-cell">Créé le</th>
              </tr>
            </thead>
            <tbody>
              {filteredProfiles.map(profile => (
                <tr
                  key={profile.id}
                  className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                >
                  <td className="p-3 text-gray-800 dark:text-gray-200 font-medium">
                    <div className="flex items-center gap-2">
                      <UsersRound size={16} className="text-gray-400" />
                      <span>{profile.full_name ?? "Sans nom"}</span>
                    </div>
                  </td>
                  <td className="p-3 text-gray-600 dark:text-gray-300">{profile.email ?? "-"}</td>
                  <td className="p-3 text-gray-600 dark:text-gray-300 hidden md:table-cell">{profile.church ?? "-"}</td>
                  <td className="p-3">
                    {canManageRoles ? (
                      <select
                        value={normalizeRole(profile.role) ?? "membre_cp"}
                        onChange={event => void handleRoleChange(profile.id, event.target.value)}
                        disabled={savingId === profile.id || profile.id === currentUserId}
                        className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-200 outline-none focus:border-cyan-400 disabled:opacity-60"
                      >
                        {ROLE_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="inline-flex rounded-full bg-cyan-50 dark:bg-cyan-900/20 px-2.5 py-1 text-xs font-medium text-cyan-700 dark:text-cyan-400">
                        {formatRole(profile.role)}
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    {canApprove && profile.id !== currentUserId ? (
                      <div className="flex items-center gap-1">
                        {profile.approved ? (
                          <>
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                              <CheckCircle size={11} /> Approuvé
                            </span>
                            <button
                              onClick={() => void handleApproval(profile.id, false)}
                              disabled={savingId === profile.id}
                              title="Révoquer l'accès"
                              className="ml-1 text-red-400 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-40"
                            >
                              <XCircle size={15} />
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 dark:bg-amber-900/20 px-2 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                              <Clock size={11} /> En attente
                            </span>
                            <button
                              onClick={() => void handleApproval(profile.id, true)}
                              disabled={savingId === profile.id}
                              title="Approuver"
                              className="ml-1 text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 disabled:opacity-40"
                            >
                              <CheckCircle size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                        profile.approved
                          ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                          : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                      }`}>
                        {profile.approved ? <CheckCircle size={11} /> : <Clock size={11} />}
                        {profile.approved ? "Approuvé" : "En attente"}
                      </span>
                    )}
                  </td>
                  <td className="p-3 hidden lg:table-cell">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      profile.completed
                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                        : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400"
                    }`}>
                      {profile.completed ? "Complet" : "Incomplet"}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                    {profile.created_at
                      ? new Date(profile.created_at).toLocaleDateString("fr-FR")
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!filteredProfiles.length && (
            <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              Aucun utilisateur trouvé.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
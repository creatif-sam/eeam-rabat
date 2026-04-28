import { Activity, Clock, FileText } from "lucide-react"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

type ActivityLog = {
  id: string
  actor_user_id: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  description: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

type ProfileRecord = {
  id: string
  full_name: string | null
  email?: string | null
}

function formatActor(actor?: ProfileRecord) {
  if (!actor) return "Utilisateur inconnu"
  return actor.full_name ?? actor.email ?? "Utilisateur inconnu"
}

function formatAction(action: string) {
  const map: Record<string, string> = {
    role_updated: "Rôle modifié"
  }

  return map[action] ?? action
}

export default async function LogsPage() {
  const supabase = await createSupabaseServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) { redirect("/auth/login") }

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  const rawRole = (currentProfile?.role ?? "").trim().toLowerCase()
  if (!["admin", "pastor"].includes(rawRole)) {
    redirect("/dashboard")
  }

  const { data: logs, error: logsError } = await supabase
    .from("activity_logs")
    .select("id, actor_user_id, action, entity_type, entity_id, description, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(100)

  if (logsError) {
    return (
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Logs</h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
            Le journal d'activité n'est pas accessible pour le moment. Exécutez le script SQL admin pour créer les politiques RLS, puis rechargez cette page.
          </p>
        </div>
      </div>
    )
  }

  const actorIds = Array.from(new Set((logs ?? []).map(log => log.actor_user_id).filter(Boolean)))

  const { data: profiles } = actorIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", actorIds)
    : { data: [] as ProfileRecord[] }

  const profilesById = new Map((profiles ?? []).map(profile => [profile.id, profile]))
  const roleChangeLogs = (logs ?? []).filter(log => log.action === "role_updated").length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Logs</h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
          Journal des actions administratives et modifications sensibles.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Entrées affichées</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{logs?.length ?? 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Changements de rôles</p>
          <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{roleChangeLogs}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Dernière mise à jour</p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {logs?.[0]?.created_at
              ? new Date(logs[0].created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })
              : "Aucune donnée"}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <Activity size={16} className="text-cyan-500" />
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">Historique récent</span>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {(logs as ActivityLog[] | null)?.map(log => {
            const actor = log.actor_user_id ? profilesById.get(log.actor_user_id) : undefined

            return (
              <div key={log.id} className="px-4 py-4 flex flex-col md:flex-row md:items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center shrink-0">
                  <FileText size={16} className="text-cyan-600 dark:text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatAction(log.action)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {log.description ?? "Aucune description"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <Clock size={13} />
                      <span>
                        {new Date(log.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-1">
                      Acteur: {formatActor(actor)}
                    </span>
                    {log.entity_type && (
                      <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-1">
                        Table: {log.entity_type}
                      </span>
                    )}
                    {log.entity_id && (
                      <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2.5 py-1">
                        Cible: {log.entity_id}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {!logs?.length && (
            <div className="px-4 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
              Aucun log disponible.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
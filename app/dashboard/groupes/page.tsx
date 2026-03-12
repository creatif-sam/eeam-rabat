"use client"

import { useEffect, useState } from "react"
import {
  Users,
  Plus,
  Search,
  Activity,
  TrendingUp,
  Eye,
  Edit,
  Phone,
  User
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Group = {
  id: string
  name: string
  category: string
  leader_name: string | null
  leader_phone: string | null
  mentor_name: string | null
  assistant_leaders: string[]
  members_count: number
  capacity: number | null
  meeting_day: string | null
  meeting_time: string | null
  location: string | null
  description: string | null
  active: boolean
}

type Member = {
  id: string
  nom: string
  prenom: string
  genre: string
  telephone: string
}

export default function GroupesTab() {
  const supabase = createClient()

  const [groups, setGroups] = useState<Group[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null)

  useEffect(() => {
    const loadGroups = async () => {
      const { data } = await supabase
        .from("groups_with_members_count")
        .select("*")
        .order("name")

      setGroups(data || [])
    }

    loadGroups()
  }, [])

  const loadMembersForGroup = async (groupName: string) => {
    setLoadingMembers(true)

    const { data } = await supabase
      .from("member_registrations")
      .select("id, nom, prenom, genre, telephone")
      .contains("commissions", [groupName])
      .order("nom")

    setMembers(data || [])
    setLoadingMembers(false)
  }

  const filteredGroups = groups.filter(g => {
    if (g.category === "none") return false

    const q = searchQuery.toLowerCase()

    return (
      (selectedCategory === "all" || g.category === selectedCategory) &&
      (
        g.name.toLowerCase().includes(q) ||
        g.leader_name?.toLowerCase().includes(q) ||
        g.mentor_name?.toLowerCase().includes(q)
      )
    )
  })

  return (
    <div className="p-4 md:p-8 space-y-6 bg-slate-50 dark:bg-gray-950 min-h-screen">

      {/* GROUP LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {filteredGroups.map(group => (
          <div key={group.id} className="bg-white dark:bg-gray-900 rounded-xl p-4 md:p-6 shadow border border-gray-100 dark:border-gray-800 hover:shadow-md dark:hover:shadow-gray-900/50 transition-shadow">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">{group.name}</h3>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Responsable: {group.leader_name || "Non assigné"}
            </p>

            <p className="text-xs text-gray-500 dark:text-gray-500">
              Mentor: {group.mentor_name || "Non assigné"}
            </p>

            <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">
              Membres: {group.members_count}
            </p>

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setSelectedGroup(group)
                  loadMembersForGroup(group.name)
                }}
                className="flex-1 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 py-2 px-3 rounded-lg flex items-center justify-center gap-2 text-sm hover:bg-cyan-100 dark:hover:bg-cyan-800/30 transition-colors"
              >
                <Eye size={16} />
                Détails
              </button>

              <button className="p-2 bg-gray-100 rounded-lg">
                <Edit size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selectedGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-start p-4 pt-20 md:pt-24 md:pl-72 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 md:p-6 w-full max-w-4xl max-h-[90vh] md:max-h-[85vh] overflow-y-auto mx-auto border border-gray-200 dark:border-gray-800">

            {/* HEADER */}
            <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              {selectedGroup.name}
            </h2>

            {/* LEADERSHIP INFO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Responsable</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                  <User size={16} />
                  {selectedGroup.leader_name || "Non assigné"}
                </p>
                {selectedGroup.leader_phone && (
                  <p className="text-sm flex items-center gap-2 mt-1">
                    <Phone size={14} />
                    {selectedGroup.leader_phone}
                  </p>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Mentor</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {selectedGroup.mentor_name || "Non assigné"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Assistants</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {selectedGroup.assistant_leaders && selectedGroup.assistant_leaders.length > 0
                    ? selectedGroup.assistant_leaders.join(", ")
                    : "Aucun"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Nombre de membres</p>
                <p className="font-semibold text-gray-800 dark:text-gray-200">
                  {selectedGroup.members_count}
                </p>
              </div>
            </div>

            {/* MEMBERS LIST */}
            <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">
              Membres du groupe
            </h3>

            {loadingMembers && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Chargement...
              </p>
            )}

            {!loadingMembers && members.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Aucun membre inscrit
              </p>
            )}

            {!loadingMembers && members.length > 0 && (
<div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  {/* Desktop Table View */}
                  <div className="hidden md:block">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 dark:bg-gray-800">
                      <tr>
                        <th className="p-2 text-left text-gray-700 dark:text-gray-300">Nom</th>
                        <th className="p-2 text-left text-gray-700 dark:text-gray-300">Sexe</th>
                        <th className="p-2 text-left text-gray-700 dark:text-gray-300">Téléphone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map(m => (
                        <tr key={m.id} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          <td className="p-2 font-medium text-gray-800 dark:text-gray-200">
                            {m.prenom} {m.nom}
                          </td>
                          <td className="p-2 text-gray-700 dark:text-gray-300">{m.genre}</td>
                          <td className="p-2 text-gray-700 dark:text-gray-300">{m.telephone}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-2 p-2">
                  {members.map(m => (
                    <div key={m.id} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                      <div className="font-medium text-sm text-gray-800 dark:text-gray-200">
                        {m.prenom} {m.nom}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Sexe: {m.genre}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Téléphone: {m.telephone}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setSelectedGroup(null)}
              className="mt-6 w-full py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

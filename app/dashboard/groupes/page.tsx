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
  User,
  Upload,
  X,
  Save
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"

type Group = {
  id: string
  name: string
  category: string
  leader_name: string | null
  leader_phone: string | null
  leader_photo_url: string | null
  mentor_name: string | null
  mentor_photo_url: string | null
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
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Group>>({})
  const [uploadingLeaderPhoto, setUploadingLeaderPhoto] = useState(false)
  const [uploadingMentorPhoto, setUploadingMentorPhoto] = useState(false)
  const [saving, setSaving] = useState(false)

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

  const handlePhotoUpload = async (file: File, type: 'leader' | 'mentor') => {
    if (!selectedGroup) return

    const setUploading = type === 'leader' ? setUploadingLeaderPhoto : setUploadingMentorPhoto
    setUploading(true)

    try {
      // Create unique file name
      const fileExt = file.name.split('.').pop()
      const fileName = `${selectedGroup.id}_${type}_${Date.now()}.${fileExt}`
      const filePath = `${fileName}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('commission-photos')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('commission-photos')
        .getPublicUrl(filePath)

      const photoUrl = urlData.publicUrl

      // Update edit form
      if (type === 'leader') {
        setEditForm(prev => ({ ...prev, leader_photo_url: photoUrl }))
      } else {
        setEditForm(prev => ({ ...prev, mentor_photo_url: photoUrl }))
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
      alert('Erreur lors du téléchargement de la photo')
    } finally {
      setUploading(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!selectedGroup) return
    setSaving(true)

    try {
      const { error } = await supabase
        .from('groups')
        .update({
          leader_name: editForm.leader_name,
          leader_phone: editForm.leader_phone,
          leader_photo_url: editForm.leader_photo_url,
          mentor_name: editForm.mentor_name,
          mentor_photo_url: editForm.mentor_photo_url,
          description: editForm.description,
          location: editForm.location,
          meeting_day: editForm.meeting_day,
          meeting_time: editForm.meeting_time,
          capacity: editForm.capacity
        })
        .eq('id', selectedGroup.id)

      if (error) throw error

      // Refresh groups list
      const { data } = await supabase
        .from("groups_with_members_count")
        .select("*")
        .order("name")
      
      setGroups(data || [])

      // Update selected group
      const updatedGroup = data?.find(g => g.id === selectedGroup.id)
      if (updatedGroup) {
        setSelectedGroup(updatedGroup)
      }

      setIsEditing(false)
      alert('Commission mise à jour avec succès!')
    } catch (error) {
      console.error('Error saving commission:', error)
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleStartEdit = (group: Group) => {
    setEditForm({
      leader_name: group.leader_name || '',
      leader_phone: group.leader_phone || '',
      leader_photo_url: group.leader_photo_url || '',
      mentor_name: group.mentor_name || '',
      mentor_photo_url: group.mentor_photo_url || '',
      description: group.description || '',
      location: group.location || '',
      meeting_day: group.meeting_day || '',
      meeting_time: group.meeting_time || '',
      capacity: group.capacity || 0
    })
    setIsEditing(true)
  }

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

              <button 
                onClick={() => {
                  setSelectedGroup(group)
                  handleStartEdit(group)
                }}
                className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors"
              >
                <Edit size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selectedGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center p-4 pt-20 md:pt-24 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-4 md:p-6 w-full max-w-5xl my-auto border border-gray-200 dark:border-gray-800">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {isEditing ? 'Modifier la Commission' : selectedGroup.name}
              </h2>
              <button
                onClick={() => {
                  setSelectedGroup(null)
                  setIsEditing(false)
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {!isEditing ? (
              /* VIEW MODE */
              <>
                {/* LEADERSHIP INFO WITH PHOTOS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* RESPONSABLE */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Responsable</p>
                    <div className="flex items-start gap-4">
                      {selectedGroup.leader_photo_url ? (
                        <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-200 dark:border-gray-700">
                          <Image
                            src={selectedGroup.leader_photo_url}
                            alt={selectedGroup.leader_name || 'Responsable'}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                          <User size={32} className="text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 dark:text-gray-200 text-lg">
                          {selectedGroup.leader_name || "Non assigné"}
                        </p>
                        {selectedGroup.leader_phone && (
                          <p className="text-sm flex items-center gap-2 mt-1 text-gray-600 dark:text-gray-400">
                            <Phone size={14} />
                            {selectedGroup.leader_phone}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* MENTOR */}
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Mentor</p>
                    <div className="flex items-start gap-4">
                      {selectedGroup.mentor_photo_url ? (
                        <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-200 dark:border-gray-700">
                          <Image
                            src={selectedGroup.mentor_photo_url}
                            alt={selectedGroup.mentor_name || 'Mentor'}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                          <User size={32} className="text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 dark:text-gray-200 text-lg">
                          {selectedGroup.mentor_name || "Non assigné"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ADDITIONAL INFO */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
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

                  {selectedGroup.location && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Lieu</p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {selectedGroup.location}
                      </p>
                    </div>
                  )}

                  {selectedGroup.meeting_day && (
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Jour de réunion</p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {selectedGroup.meeting_day} {selectedGroup.meeting_time && `à ${selectedGroup.meeting_time}`}
                      </p>
                    </div>
                  )}
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

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => handleStartEdit(selectedGroup)}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    Modifier
                  </button>
                  <button
                    onClick={() => setSelectedGroup(null)}
                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    Fermer
                  </button>
                </div>
              </>
            ) : (
              /* EDIT MODE */
              <div className="space-y-6">
                {/* PHOTO UPLOADS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* RESPONSABLE PHOTO */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Photo du Responsable
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {editForm.leader_photo_url ? (
                        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                          <Image
                            src={editForm.leader_photo_url}
                            alt="Responsable"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <User size={32} className="text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                      <label className="flex-1 cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handlePhotoUpload(file, 'leader')
                          }}
                          disabled={uploadingLeaderPhoto}
                        />
                        <div className="py-2 px-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors text-sm">
                          <Upload size={16} />
                          {uploadingLeaderPhoto ? 'Téléchargement...' : 'Télécharger une photo'}
                        </div>
                      </label>
                    </div>

                    <input
                      type="text"
                      value={editForm.leader_name || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, leader_name: e.target.value }))}
                      placeholder="Nom du responsable"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                    <input
                      type="tel"
                      value={editForm.leader_phone || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, leader_phone: e.target.value }))}
                      placeholder="Téléphone du responsable"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  {/* MENTOR PHOTO */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Photo du Mentor
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      {editForm.mentor_photo_url ? (
                        <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                          <Image
                            src={editForm.mentor_photo_url}
                            alt="Mentor"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <User size={32} className="text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                      <label className="flex-1 cursor-pointer">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handlePhotoUpload(file, 'mentor')
                          }}
                          disabled={uploadingMentorPhoto}
                        />
                        <div className="py-2 px-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-100 dark:hover:bg-blue-800/30 transition-colors text-sm">
                          <Upload size={16} />
                          {uploadingMentorPhoto ? 'Téléchargement...' : 'Télécharger une photo'}
                        </div>
                      </label>
                    </div>

                    <input
                      type="text"
                      value={editForm.mentor_name || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, mentor_name: e.target.value }))}
                      placeholder="Nom du mentor"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                {/* OTHER FIELDS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Lieu de réunion
                    </label>
                    <input
                      type="text"
                      value={editForm.location || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Lieu"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Capacité
                    </label>
                    <input
                      type="number"
                      value={editForm.capacity || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                      placeholder="Capacité"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Jour de réunion
                    </label>
                    <input
                      type="text"
                      value={editForm.meeting_day || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, meeting_day: e.target.value }))}
                      placeholder="Ex: Lundi"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Heure de réunion
                    </label>
                    <input
                      type="time"
                      value={editForm.meeting_time || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, meeting_time: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description de la commission"
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  />
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={handleSaveEdit}
                    disabled={saving}
                    className="flex-1 py-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={16} />
                    {saving ? 'Sauvegarde...' : 'Enregistrer'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false)
                      setEditForm({})
                    }}
                    disabled={saving}
                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

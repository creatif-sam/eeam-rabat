"use client";

import React, { useState } from 'react';
import { Users, Plus, Search, Filter, Calendar, User, MapPin, Clock, TrendingUp, Eye, Edit, Mail, Phone, Activity, Download } from 'lucide-react';

export default function GroupesTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedGroup, setSelectedGroup] = useState<typeof groups[0] | null>(null);

  const groupStats = {
    totalGroups: 12,
    totalMembers: 342,
    activeGroups: 11,
    averageAttendance: 82,
    newMembersThisMonth: 15
  };

  const groups = [
    {
      id: 1,
      name: 'Jeunes Adultes',
      category: 'age',
      leader: 'Ahmed Alaoui',
      leaderPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
      members: 95,
      capacity: 120,
      meetingDay: 'Vendredi',
      meetingTime: '19:00',
      location: 'Salle jeunesse',
      description: 'Groupe pour les 18-35 ans avec études bibliques et activités',
      nextMeeting: '2026-01-17',
      attendance: 88,
      active: true,
      color: 'from-cyan-500 to-blue-600'
    },
    {
      id: 2,
      name: 'Groupe Hommes',
      category: 'gender',
      leader: 'Youssef Idrissi',
      leaderPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
      members: 78,
      capacity: 100,
      meetingDay: 'Samedi',
      meetingTime: '08:00',
      location: 'Salle principale',
      description: 'Groupe de fellowship et croissance spirituelle pour hommes',
      nextMeeting: '2026-01-18',
      attendance: 85,
      active: true,
      color: 'from-blue-500 to-indigo-600'
    },
    {
      id: 3,
      name: 'Groupe Femmes',
      category: 'gender',
      leader: 'Sarah Mansouri',
      leaderPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
      members: 82,
      capacity: 100,
      meetingDay: 'Mercredi',
      meetingTime: '14:00',
      location: 'Salle de prière',
      description: 'Groupe de prière et étude biblique pour femmes',
      nextMeeting: '2026-01-15',
      attendance: 79,
      active: true,
      color: 'from-pink-500 to-rose-600'
    },
    {
      id: 4,
      name: 'Couples & Familles',
      category: 'family',
      leader: 'Jean & Marie Dubois',
      leaderPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80',
      members: 54,
      capacity: 80,
      meetingDay: 'Dimanche',
      meetingTime: '16:00',
      location: 'Salle familiale',
      description: 'Groupe pour couples et familles avec enfants',
      nextMeeting: '2026-01-12',
      attendance: 75,
      active: true,
      color: 'from-purple-500 to-violet-600'
    },
    {
      id: 5,
      name: 'Seniors',
      category: 'age',
      leader: 'Robert Martin',
      leaderPhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80',
      members: 33,
      capacity: 50,
      meetingDay: 'Mardi',
      meetingTime: '15:00',
      location: 'Salle seniors',
      description: 'Groupe pour les 60 ans et plus',
      nextMeeting: '2026-01-14',
      attendance: 90,
      active: true,
      color: 'from-amber-500 to-orange-600'
    },
  ];

  const categories = [
    { id: 'all', label: 'Tous', count: groups.length },
    { id: 'age', label: 'Par âge', count: groups.filter(g => g.category === 'age').length },
    { id: 'gender', label: 'Par genre', count: groups.filter(g => g.category === 'gender').length },
    { id: 'family', label: 'Familles', count: groups.filter(g => g.category === 'family').length },
  ];

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.leader.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || group.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestion des Groupes</h1>
          <p className="text-gray-600">Organisation et suivi des groupes de l'église</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm">
            <Download size={18} />
            <span className="font-medium">Exporter</span>
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/30">
            <Plus size={18} />
            <span className="font-medium">Créer un groupe</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
            <Users size={24} className="text-white" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Total groupes</p>
          <p className="text-3xl font-bold text-gray-800">{groupStats.totalGroups}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 shadow-sm">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30 mb-4">
            <Activity size={24} className="text-white" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Groupes actifs</p>
          <p className="text-3xl font-bold text-gray-800">{groupStats.activeGroups}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-100 shadow-sm">
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 mb-4">
            <Users size={24} className="text-white" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Total membres</p>
          <p className="text-3xl font-bold text-gray-800">{groupStats.totalMembers}</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl p-6 border border-cyan-100 shadow-sm">
          <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-4">
            <TrendingUp size={24} className="text-white" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Assiduité moyenne</p>
          <p className="text-3xl font-bold text-gray-800">{groupStats.averageAttendance}%</p>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-100 shadow-sm">
          <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/30 mb-4">
            <Plus size={24} className="text-white" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Nouveaux ce mois</p>
          <p className="text-3xl font-bold text-gray-800">{groupStats.newMembersThisMonth}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-cyan-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat.label} ({cat.count})
              </button>
            ))}
          </div>

          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un groupe..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent w-64"
            />
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredGroups.map((group) => (
          <div key={group.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
            {/* Card Header */}
            <div className={`relative h-32 bg-gradient-to-br ${group.color} p-6 flex items-end`}>
              <div className="text-white">
                <h3 className="text-2xl font-bold mb-1">{group.name}</h3>
                <p className="text-white/80 text-sm">{group.members} membres · {group.attendance}% assiduité</p>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 space-y-4">
              {/* Leader */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                  <img src={group.leaderPhoto} alt={group.leader} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Responsable</p>
                  <p className="font-semibold text-gray-800">{group.leader}</p>
                </div>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm">{group.description}</p>

              {/* Meeting Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={14} className="text-gray-400" />
                  <span>{group.meetingDay} à {group.meetingTime}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={14} className="text-gray-400" />
                  <span>{group.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={14} className="text-gray-400" />
                  <span>Prochaine réunion: {new Date(group.nextMeeting).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                </div>
              </div>

              {/* Capacity Bar */}
              <div>
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Capacité</span>
                  <span className="font-semibold">{group.members}/{group.capacity}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${group.color}`}
                    style={{ width: `${(group.members / group.capacity) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button 
                  onClick={() => setSelectedGroup(group)}
                  className="flex-1 px-4 py-2 bg-cyan-50 text-cyan-600 rounded-xl hover:bg-cyan-100 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Eye size={16} />
                  Voir détails
                </button>
                <button className="px-4 py-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors">
                  <Edit size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Group Detail Modal */}
      {selectedGroup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className={`bg-gradient-to-r ${selectedGroup.color} p-6 text-white`}>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">{selectedGroup.name}</h2>
                  <p className="text-white/90">{selectedGroup.description}</p>
                </div>
                <button
                  onClick={() => setSelectedGroup(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-xl">
                  <p className="text-3xl font-bold text-blue-600">{selectedGroup.members}</p>
                  <p className="text-sm text-gray-600 mt-1">Membres</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-xl">
                  <p className="text-3xl font-bold text-green-600">{selectedGroup.attendance}%</p>
                  <p className="text-sm text-gray-600 mt-1">Assiduité</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-xl">
                  <p className="text-3xl font-bold text-purple-600">{selectedGroup.capacity}</p>
                  <p className="text-sm text-gray-600 mt-1">Capacité</p>
                </div>
              </div>

              {/* Leader Info */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3">Responsable du groupe</h3>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                    <img src={selectedGroup.leaderPhoto} alt={selectedGroup.leader} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-lg">{selectedGroup.leader}</p>
                    <div className="flex gap-4 mt-2">
                      <button className="text-cyan-600 hover:text-cyan-700 text-sm flex items-center gap-1">
                        <Mail size={14} /> Contacter
                      </button>
                      <button className="text-cyan-600 hover:text-cyan-700 text-sm flex items-center gap-1">
                        <Phone size={14} /> Appeler
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Meeting Schedule */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3">Horaire des réunions</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <Calendar size={20} className="text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-800">Tous les {selectedGroup.meetingDay}</p>
                      <p className="text-sm text-gray-600">À {selectedGroup.meetingTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-100 rounded-xl">
                    <MapPin size={20} className="text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-800">{selectedGroup.location}</p>
                      <p className="text-sm text-gray-600">Lieu de rencontre</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-xl">
                    <Clock size={20} className="text-green-600" />
                    <div>
                      <p className="font-medium text-gray-800">Prochaine réunion</p>
                      <p className="text-sm text-gray-600">
                        {new Date(selectedGroup.nextMeeting).toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button className="flex-1 px-6 py-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-colors font-medium">
                  Voir les membres
                </button>
                <button className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium">
                  Modifier le groupe
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
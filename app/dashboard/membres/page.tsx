import React, { useState } from 'react';
import { Users, UserPlus, Search, Filter, Download, Mail, Phone, MapPin, Calendar, Eye, Edit, MoreVertical, TrendingUp, UserCheck, UserX, Clock, Activity } from 'lucide-react';

export default function MembersTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'

  // Sample data - replace with your API calls
  const memberStats = {
    totalMembers: 342,
    activeMembers: 298,
    newThisMonth: 12,
    baptizedThisYear: 28,
    averageAttendance: 87,
    growthRate: 5.3,
  };

  const members = [
    {
      id: 1,
      name: 'Sarah Mansouri',
      email: 'sarah.m@email.com',
      phone: '+212 6XX XXX XXX',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
      status: 'active',
      joinDate: '2023-05-12',
      baptismDate: '2024-01-15',
      group: 'Jeunes Adultes',
      ministry: 'Louange',
      attendance: 92,
      lastSeen: '2026-01-09',
    },
    {
      id: 2,
      name: 'Ahmed Alaoui',
      email: 'ahmed.alaoui@email.com',
      phone: '+212 6XX XXX XXX',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
      status: 'active',
      joinDate: '2022-11-20',
      baptismDate: '2023-06-10',
      group: 'Hommes',
      ministry: 'Accueil',
      attendance: 88,
      lastSeen: '2026-01-09',
    },
    {
      id: 3,
      name: 'Fatima Benali',
      email: 'fatima.b@email.com',
      phone: '+212 6XX XXX XXX',
      photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
      status: 'active',
      joinDate: '2024-02-14',
      baptismDate: null,
      group: 'Femmes',
      ministry: 'Intercession',
      attendance: 95,
      lastSeen: '2026-01-08',
    },
    {
      id: 4,
      name: 'Youssef Idrissi',
      email: 'youssef.i@email.com',
      phone: '+212 6XX XXX XXX',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
      status: 'inactive',
      joinDate: '2021-08-05',
      baptismDate: '2022-03-20',
      group: 'Hommes',
      ministry: null,
      attendance: 45,
      lastSeen: '2025-12-15',
    },
    {
      id: 5,
      name: 'Amina Rahmani',
      email: 'amina.r@email.com',
      phone: '+212 6XX XXX XXX',
      photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80',
      status: 'active',
      joinDate: '2023-09-30',
      baptismDate: '2024-04-12',
      group: 'Jeunes Adultes',
      ministry: 'Enfants',
      attendance: 90,
      lastSeen: '2026-01-09',
    },
    {
      id: 6,
      name: 'Karim Benjelloun',
      email: 'karim.b@email.com',
      phone: '+212 6XX XXX XXX',
      photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80',
      status: 'new',
      joinDate: '2026-01-05',
      baptismDate: null,
      group: null,
      ministry: null,
      attendance: 100,
      lastSeen: '2026-01-09',
    },
  ];

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.group?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' || member.status === filterStatus;

    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'inactive': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'new': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'active': return 'Actif';
      case 'inactive': return 'Inactif';
      case 'new': return 'Nouveau';
      default: return status;
    }
  };

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestion des Membres</h1>
          <p className="text-gray-600">Suivi et administration des membres de l'église</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm">
            <Download size={18} />
            <span className="font-medium">Exporter</span>
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/30">
            <UserPlus size={18} />
            <span className="font-medium">Ajouter membre</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Members */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Users size={24} className="text-white" />
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
              +{memberStats.growthRate}%
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-1">Total membres</p>
          <p className="text-3xl font-bold text-gray-800">{memberStats.totalMembers}</p>
        </div>

        {/* Active Members */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
              <UserCheck size={24} className="text-white" />
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
              {Math.round((memberStats.activeMembers / memberStats.totalMembers) * 100)}%
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-1">Membres actifs</p>
          <p className="text-3xl font-bold text-gray-800">{memberStats.activeMembers}</p>
        </div>

        {/* New This Month */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-100 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
              <TrendingUp size={24} className="text-white" />
            </div>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
              Ce mois
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-1">Nouveaux membres</p>
          <p className="text-3xl font-bold text-gray-800">{memberStats.newThisMonth}</p>
        </div>

        {/* Baptisms This Year */}
        <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl p-6 border border-cyan-100 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Activity size={24} className="text-white" />
            </div>
            <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs font-semibold">
              2026
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-1">Baptêmes</p>
          <p className="text-3xl font-bold text-gray-800">{memberStats.baptizedThisYear}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === 'all'
                  ? 'bg-cyan-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tous ({members.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === 'active'
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Actifs ({members.filter(m => m.status === 'active').length})
            </button>
            <button
              onClick={() => setFilterStatus('new')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === 'new'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Nouveaux ({members.filter(m => m.status === 'new').length})
            </button>
            <button
              onClick={() => setFilterStatus('inactive')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                filterStatus === 'inactive'
                  ? 'bg-gray-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Inactifs ({members.filter(m => m.status === 'inactive').length})
            </button>
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un membre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent w-64"
              />
            </div>
            <button className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2">
              <Filter size={18} />
              Filtres avancés
            </button>
          </div>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div key={member.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
            {/* Card Header */}
            <div className="relative h-32 bg-gradient-to-br from-cyan-500 to-blue-600">
              <div className="absolute top-4 right-4">
                <button className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors">
                  <MoreVertical size={18} className="text-white" />
                </button>
              </div>
              <div className="absolute -bottom-12 left-6">
                <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-gray-200">
                  <img 
                    src={member.photo} 
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="pt-16 px-6 pb-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{member.name}</h3>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(member.status)}`}>
                    {getStatusLabel(member.status)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={14} className="text-gray-400" />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={14} className="text-gray-400" />
                  <span>{member.phone}</span>
                </div>
                {member.group && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users size={14} className="text-gray-400" />
                    <span>{member.group}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar size={14} className="text-gray-400" />
                  <span>Membre depuis {new Date(member.joinDate).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}</span>
                </div>
              </div>

              {/* Attendance Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Assiduité</span>
                  <span className="font-semibold">{member.attendance}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      member.attendance >= 80
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                        : member.attendance >= 60
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-600'
                        : 'bg-gradient-to-r from-rose-500 to-red-600'
                    }`}
                    style={{ width: `${member.attendance}%` }}
                  ></div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-cyan-50 text-cyan-600 rounded-xl hover:bg-cyan-100 transition-colors font-medium flex items-center justify-center gap-2">
                  <Eye size={16} />
                  Voir
                </button>
                <button className="flex-1 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors font-medium flex items-center justify-center gap-2">
                  <Edit size={16} />
                  Modifier
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredMembers.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users size={32} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Aucun membre trouvé</h3>
          <p className="text-gray-600 mb-6">Essayez de modifier vos critères de recherche</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setFilterStatus('all');
            }}
            className="px-6 py-2 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-colors font-medium"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  );
}
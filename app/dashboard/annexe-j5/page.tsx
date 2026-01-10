"use client";
import React, { useState } from 'react';
import { Building2, Users, TrendingUp, Calendar, MapPin, DollarSign, Activity, Phone, Mail, Clock, Plus, Download, Eye, Edit, ChevronRight, FileText, Video } from 'lucide-react';

export default function JSAnnexTab() {
  const [selectedView, setSelectedView] = useState('overview');

  // Sample data - replace with your API calls
  const annexStats = {
    members: 85,
    attendance: 72,
    growth: 12,
    events: 8,
    revenue: 45000,
    leaders: 6
  };

  const annexInfo = {
    name: 'JS Annex',
    fullName: 'Annexe JS',
    location: 'Zone JS, Salé',
    address: 'Rue XX, Quartier JS, Salé, Maroc',
    phone: '+212 6XX XXX XXX',
    email: 'js.annex@eeam.ma',
    establishedDate: '2023-06-15',
    mainPastor: 'Pastor David Mensah',
    coordinator: 'Sarah Alami'
  };

  const jsLeaders = [
    {
      id: 1,
      name: 'Pastor David Mensah',
      role: 'Pasteur Principal',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
      phone: '+212 6XX XXX XXX',
      email: 'david.m@eeam.ma',
      responsibilities: ['Prédication', 'Vision', 'Leadership']
    },
    {
      id: 2,
      name: 'Sarah Alami',
      role: 'Coordinatrice',
      photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
      phone: '+212 6XX XXX XXX',
      email: 'sarah.a@eeam.ma',
      responsibilities: ['Administration', 'Coordination', 'Événements']
    },
    {
      id: 3,
      name: 'Ahmed Benali',
      role: 'Responsable Louange',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
      phone: '+212 6XX XXX XXX',
      email: 'ahmed.b@eeam.ma',
      responsibilities: ['Louange', 'Formation musicale', 'Équipe technique']
    },
    {
      id: 4,
      name: 'Fatima Rahmani',
      role: 'Responsable Jeunesse',
      photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
      phone: '+212 6XX XXX XXX',
      email: 'fatima.r@eeam.ma',
      responsibilities: ['Jeunes', 'Activités', 'Discipulat jeunes']
    },
  ];

  const jsEvents = [
    {
      id: 1,
      title: 'Culte Dominical JS',
      date: '2026-01-11',
      time: '10:00',
      type: 'worship',
      attendees: 68,
      status: 'upcoming'
    },
    {
      id: 2,
      title: 'Réunion de Prière JS',
      date: '2026-01-15',
      time: '19:00',
      type: 'prayer',
      attendees: 32,
      status: 'upcoming'
    },
    {
      id: 3,
      title: 'Formation Leadership JS',
      date: '2026-01-20',
      time: '18:00',
      type: 'formation',
      attendees: 25,
      status: 'upcoming'
    },
  ];

  const jsGroups = [
    { id: 1, name: 'Jeunes JS', members: 28, leader: 'Fatima Rahmani' },
    { id: 2, name: 'Hommes JS', members: 22, leader: 'Ahmed Benali' },
    { id: 3, name: 'Femmes JS', members: 25, leader: 'Sarah Alami' },
    { id: 4, name: 'Couples JS', members: 10, leader: 'David & Marie' },
  ];

  const monthlyStats = [
    { month: 'Août', members: 65, attendance: 58 },
    { month: 'Sept', members: 68, attendance: 61 },
    { month: 'Oct', members: 72, attendance: 64 },
    { month: 'Nov', members: 78, attendance: 68 },
    { month: 'Déc', members: 82, attendance: 70 },
    { month: 'Jan', members: 85, attendance: 72 },
  ];

  const recentReports = [
    {
      id: 1,
      title: 'Rapport Mensuel JS - Janvier 2026',
      date: '2026-01-09',
      type: 'monthly',
      size: '1.2 MB'
    },
    {
      id: 2,
      title: 'Statistiques Financières JS - Décembre 2025',
      date: '2026-01-01',
      type: 'financial',
      size: '890 KB'
    },
    {
      id: 3,
      title: 'Bilan Trimestriel JS - Q4 2025',
      date: '2025-12-31',
      type: 'quarterly',
      size: '2.1 MB'
    },
  ];

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Building2 size={32} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">Annexe JS</h1>
            <p className="text-gray-600">{annexInfo.location}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm">
            <Download size={18} />
            <span className="font-medium">Exporter</span>
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all flex items-center gap-2 shadow-lg shadow-orange-500/30">
            <Plus size={18} />
            <span className="font-medium">Ajouter activité</span>
          </button>
        </div>
      </div>

      {/* View Selector */}
      <div className="flex gap-2 bg-white p-1.5 rounded-xl shadow-sm w-fit">
        {['overview', 'members', 'events', 'reports'].map((view) => (
          <button
            key={view}
            onClick={() => setSelectedView(view)}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              selectedView === view
                ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {view === 'overview' ? 'Vue d\'ensemble' : 
             view === 'members' ? 'Membres' : 
             view === 'events' ? 'Événements' : 'Rapports'}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
            <Users size={24} className="text-white" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Membres</p>
          <p className="text-3xl font-bold text-gray-800">{annexStats.members}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 shadow-sm">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30 mb-4">
            <Activity size={24} className="text-white" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Assiduité</p>
          <p className="text-3xl font-bold text-gray-800">{annexStats.attendance}%</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-100 shadow-sm">
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 mb-4">
            <TrendingUp size={24} className="text-white" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Croissance</p>
          <p className="text-3xl font-bold text-gray-800">+{annexStats.growth}</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl p-6 border border-cyan-100 shadow-sm">
          <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-4">
            <Calendar size={24} className="text-white" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Événements</p>
          <p className="text-3xl font-bold text-gray-800">{annexStats.events}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100 shadow-sm">
          <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30 mb-4">
            <DollarSign size={24} className="text-white" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Revenus</p>
          <p className="text-3xl font-bold text-gray-800">{(annexStats.revenue/1000).toFixed(0)}K</p>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-100 shadow-sm">
          <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/30 mb-4">
            <Users size={24} className="text-white" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Leaders</p>
          <p className="text-3xl font-bold text-gray-800">{annexStats.leaders}</p>
        </div>
      </div>

      {/* Main Content Based on Selected View */}
      {selectedView === 'overview' && (
        <>
          {/* Annex Information */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Building2 size={24} className="text-orange-600" />
                Informations de l'annexe
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Contact</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <MapPin size={18} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Adresse</p>
                        <p className="font-medium text-gray-800">{annexInfo.address}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={18} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Téléphone</p>
                        <p className="font-medium text-gray-800">{annexInfo.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail size={18} className="text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-800">{annexInfo.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Direction</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Pasteur Principal</p>
                      <p className="font-medium text-gray-800">{annexInfo.mainPastor}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Coordinateur</p>
                      <p className="font-medium text-gray-800">{annexInfo.coordinator}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date d'établissement</p>
                      <p className="font-medium text-gray-800">
                        {new Date(annexInfo.establishedDate).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4">Croissance mensuelle</h3>
              <div className="space-y-3">
                {monthlyStats.slice(-3).map((stat, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{stat.month}</span>
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-800">{stat.members} membres</p>
                        <p className="text-xs text-gray-500">{stat.attendance} présents</p>
                      </div>
                      <TrendingUp size={16} className="text-green-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Leaders */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users size={24} className="text-orange-600" />
              Équipe de Leadership
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {jsLeaders.map((leader) => (
                <div key={leader.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all hover:border-orange-300">
                  <div className="flex flex-col items-center text-center mb-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden mb-3 border-4 border-orange-100">
                      <img src={leader.photo} alt={leader.name} className="w-full h-full object-cover" />
                    </div>
                    <h3 className="font-bold text-gray-800">{leader.name}</h3>
                    <p className="text-sm text-orange-600 font-medium">{leader.role}</p>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Mail size={12} />
                      <span className="truncate">{leader.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Phone size={12} />
                      <span>{leader.phone}</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-2">Responsabilités:</p>
                    <div className="flex flex-wrap gap-1">
                      {leader.responsibilities.map((resp, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded text-xs">
                          {resp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Groups */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Users size={24} className="text-orange-600" />
                Groupes JS
              </h2>
              <button className="text-orange-600 hover:text-orange-700 font-medium text-sm flex items-center gap-1">
                Voir tous <ChevronRight size={16} />
              </button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {jsGroups.map((group) => (
                <div key={group.id} className="p-4 bg-gradient-to-br from-orange-50 to-red-50 border border-orange-100 rounded-xl">
                  <h3 className="font-bold text-gray-800 mb-2">{group.name}</h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{group.members} membres</span>
                    <span className="text-orange-600 font-medium">{group.leader}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar size={24} className="text-orange-600" />
              Événements à venir
            </h2>
            <div className="space-y-3">
              {jsEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-md transition-all hover:border-orange-300">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <Calendar size={24} className="text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{event.title}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(event.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} · {event.time}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">{event.attendees} participants</p>
                    <p className="text-xs text-gray-500">Attendus</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Reports */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText size={24} className="text-orange-600" />
              Rapports récents
            </h2>
            <div className="space-y-3">
              {recentReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-md transition-all hover:border-orange-300">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <FileText size={24} className="text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{report.title}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(report.date).toLocaleDateString('fr-FR')} · {report.size}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-orange-50 rounded-lg transition-colors">
                    <Download size={20} className="text-orange-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {selectedView === 'members' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Membres de l'Annexe JS</h2>
          <p className="text-gray-600">Section membres - à développer avec la liste complète des membres JS</p>
        </div>
      )}

      {selectedView === 'events' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Événements JS</h2>
          <p className="text-gray-600">Section événements - à développer avec le calendrier complet JS</p>
        </div>
      )}

      {selectedView === 'reports' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Rapports JS</h2>
          <p className="text-gray-600">Section rapports - à développer avec les rapports détaillés JS</p>
        </div>
      )}
    </div>
  );
}
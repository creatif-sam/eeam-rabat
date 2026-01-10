"use client";

import React, { useState } from 'react';
import { GraduationCap, Plus, Search, Filter, Clock, Users, CheckCircle, Play, BookOpen, Award, TrendingUp, Calendar, Download, Eye, Edit, Video, FileText } from 'lucide-react';

export default function FormationsTab() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedFormation, setSelectedFormation] = useState(null);

  const formationStats = {
    totalFormations: 15,
    activeFormations: 8,
    totalParticipants: 245,
    completedThisYear: 156,
    averageCompletion: 78
  };

  const formations = [
    {
      id: 1,
      title: 'Formation Leadership Chrétien',
      category: 'leadership',
      instructor: 'Pastor Jean',
      instructorPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
      description: 'Développer les compétences de leadership selon les principes bibliques',
      duration: '8 semaines',
      sessions: 8,
      completedSessions: 3,
      participants: 25,
      maxParticipants: 30,
      startDate: '2026-01-06',
      endDate: '2026-02-24',
      schedule: 'Lundi 19:00-21:00',
      location: 'Salle de conférence',
      level: 'Intermédiaire',
      status: 'in-progress',
      completionRate: 78,
      color: 'from-blue-500 to-indigo-600',
      modules: [
        { id: 1, title: 'Vision et Mission', completed: true },
        { id: 2, title: 'Communication efficace', completed: true },
        { id: 3, title: 'Gestion d\'équipe', completed: true },
        { id: 4, title: 'Prise de décision', completed: false },
        { id: 5, title: 'Gestion des conflits', completed: false },
        { id: 6, title: 'Délégation', completed: false },
        { id: 7, title: 'Mentorat', completed: false },
        { id: 8, title: 'Projet final', completed: false },
      ],
      isOnline: false
    },
    {
      id: 2,
      title: 'Discipulat - Les Fondements',
      category: 'discipleship',
      instructor: 'Jonathan Santos',
      instructorPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
      description: 'Formation sur les bases de la foi et du discipulat chrétien',
      duration: '6 semaines',
      sessions: 6,
      completedSessions: 4,
      participants: 45,
      maxParticipants: 50,
      startDate: '2025-12-05',
      endDate: '2026-01-16',
      schedule: 'Jeudi 20:00-21:30',
      location: 'En visioconférence',
      level: 'Débutant',
      status: 'in-progress',
      completionRate: 85,
      color: 'from-purple-500 to-violet-600',
      modules: [
        { id: 1, title: 'Le Salut', completed: true },
        { id: 2, title: 'La Prière', completed: true },
        { id: 3, title: 'La Bible', completed: true },
        { id: 4, title: 'L\'Église', completed: true },
        { id: 5, title: 'Le Saint-Esprit', completed: false },
        { id: 6, title: 'Le Témoignage', completed: false },
      ],
      isOnline: true
    },
    {
      id: 3,
      title: 'École de Louange',
      category: 'worship',
      instructor: 'Ahmed Benali',
      instructorPhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&q=80',
      description: 'Formation musicale et théologique sur la louange et l\'adoration',
      duration: '10 semaines',
      sessions: 10,
      completedSessions: 0,
      participants: 18,
      maxParticipants: 25,
      startDate: '2026-01-20',
      endDate: '2026-03-31',
      schedule: 'Samedi 10:00-12:00',
      location: 'Studio de musique',
      level: 'Tous niveaux',
      status: 'upcoming',
      completionRate: 0,
      color: 'from-pink-500 to-rose-600',
      modules: [
        { id: 1, title: 'Théologie de la louange', completed: false },
        { id: 2, title: 'Technique vocale', completed: false },
        { id: 3, title: 'Instruments de louange', completed: false },
        { id: 4, title: 'Direction de louange', completed: false },
        { id: 5, title: 'Composition', completed: false },
      ],
      isOnline: false
    },
    {
      id: 4,
      title: 'Évangélisation Pratique',
      category: 'evangelism',
      instructor: 'Sarah Martin',
      instructorPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
      description: 'Méthodes pratiques pour partager l\'évangile efficacement',
      duration: '4 semaines',
      sessions: 4,
      completedSessions: 4,
      participants: 32,
      maxParticipants: 40,
      startDate: '2025-12-01',
      endDate: '2025-12-22',
      schedule: 'Dimanche 14:00-16:00',
      location: 'Salle principale',
      level: 'Tous niveaux',
      status: 'completed',
      completionRate: 92,
      color: 'from-green-500 to-emerald-600',
      modules: [
        { id: 1, title: 'Notre témoignage', completed: true },
        { id: 2, title: 'Partage de l\'évangile', completed: true },
        { id: 3, title: 'Répondre aux objections', completed: true },
        { id: 4, title: 'Suivi des nouveaux', completed: true },
      ],
      isOnline: false
    },
    {
      id: 5,
      title: 'Gestion Financière Biblique',
      category: 'stewardship',
      instructor: 'David Mensah',
      instructorPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
      description: 'Principes bibliques de gestion de l\'argent et des ressources',
      duration: '5 semaines',
      sessions: 5,
      completedSessions: 2,
      participants: 28,
      maxParticipants: 35,
      startDate: '2026-01-08',
      endDate: '2026-02-05',
      schedule: 'Mercredi 19:30-21:00',
      location: 'Salle 3',
      level: 'Débutant',
      status: 'in-progress',
      completionRate: 71,
      color: 'from-amber-500 to-orange-600',
      modules: [
        { id: 1, title: 'Principes bibliques', completed: true },
        { id: 2, title: 'Budget familial', completed: true },
        { id: 3, title: 'Épargne et investissement', completed: false },
        { id: 4, title: 'Dette et liberté', completed: false },
        { id: 5, title: 'Générosité', completed: false },
      ],
      isOnline: false
    },
  ];

  const categories = [
    { id: 'all', label: 'Toutes', count: formations.length },
    { id: 'leadership', label: 'Leadership', count: formations.filter(f => f.category === 'leadership').length },
    { id: 'discipleship', label: 'Discipulat', count: formations.filter(f => f.category === 'discipleship').length },
    { id: 'worship', label: 'Louange', count: formations.filter(f => f.category === 'worship').length },
    { id: 'evangelism', label: 'Évangélisation', count: formations.filter(f => f.category === 'evangelism').length },
    { id: 'stewardship', label: 'Gestion', count: formations.filter(f => f.category === 'stewardship').length },
  ];

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'in-progress':
        return { label: 'En cours', color: 'bg-blue-100 text-blue-700 border-blue-200' };
      case 'upcoming':
        return { label: 'À venir', color: 'bg-purple-100 text-purple-700 border-purple-200' };
      case 'completed':
        return { label: 'Terminé', color: 'bg-green-100 text-green-700 border-green-200' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700 border-gray-200' };
    }
  };

  const filteredFormations = formations.filter(formation => {
    const matchesSearch = formation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         formation.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || formation.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestion des Formations</h1>
          <p className="text-gray-600">Formations et programmes de développement spirituel</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm">
            <Download size={18} />
            <span className="font-medium">Exporter</span>
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/30">
            <Plus size={18} />
            <span className="font-medium">Nouvelle formation</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
            <GraduationCap size={24} className="text-white" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Total formations</p>
          <p className="text-3xl font-bold text-gray-800">{formationStats.totalFormations}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 shadow-sm">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30 mb-4">
            <Play size={24} className="text-white" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Formations actives</p>
          <p className="text-3xl font-bold text-gray-800">{formationStats.activeFormations}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-100 shadow-sm">
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 mb-4">
            <Users size={24} className="text-white" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Participants</p>
          <p className="text-3xl font-bold text-gray-800">{formationStats.totalParticipants}</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl p-6 border border-cyan-100 shadow-sm">
          <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-4">
            <Award size={24} className="text-white" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Certifiés 2026</p>
          <p className="text-3xl font-bold text-gray-800">{formationStats.completedThisYear}</p>
        </div>

        <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-100 shadow-sm">
          <div className="w-12 h-12 bg-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/30 mb-4">
            <TrendingUp size={24} className="text-white" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Taux d'achèvement</p>
          <p className="text-3xl font-bold text-gray-800">{formationStats.averageCompletion}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2 flex-wrap">
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
              placeholder="Rechercher une formation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent w-64"
            />
          </div>
        </div>
      </div>

      {/* Formations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredFormations.map((formation) => {
          const statusBadge = getStatusBadge(formation.status);
          return (
            <div key={formation.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
              {/* Card Header */}
              <div className={`relative h-40 bg-gradient-to-br ${formation.color} p-6`}>
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusBadge.color}`}>
                    {statusBadge.label}
                  </span>
                  {formation.isOnline && (
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold text-white flex items-center gap-1">
                      <Video size={12} /> En ligne
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{formation.title}</h3>
                <p className="text-white/80 text-sm">{formation.description}</p>
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4">
                {/* Instructor */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                    <img src={formation.instructorPhoto} alt={formation.instructor} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Formateur</p>
                    <p className="font-semibold text-gray-800">{formation.instructor}</p>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock size={14} className="text-gray-400" />
                    <span>{formation.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <BookOpen size={14} className="text-gray-400" />
                    <span>{formation.sessions} sessions</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users size={14} className="text-gray-400" />
                    <span>{formation.participants}/{formation.maxParticipants}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={14} className="text-gray-400" />
                    <span>{formation.schedule.split(' ')[0]}</span>
                  </div>
                </div>

                {/* Progress */}
                {formation.status === 'in-progress' && (
                  <div>
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Progression</span>
                      <span className="font-semibold">{formation.completedSessions}/{formation.sessions} sessions</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${formation.color}`}
                        style={{ width: `${(formation.completedSessions / formation.sessions) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Completion Rate */}
                {formation.status === 'completed' && (
                  <div className="bg-green-50 border border-green-100 rounded-xl p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-700 font-medium">Taux de réussite</span>
                      <span className="text-lg font-bold text-green-600">{formation.completionRate}%</span>
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="pt-3 border-t border-gray-100 text-xs text-gray-600">
                  {formation.status === 'upcoming' ? (
                    <p>Début: {new Date(formation.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</p>
                  ) : (
                    <p>
                      {new Date(formation.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - {' '}
                      {new Date(formation.endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => setSelectedFormation(formation)}
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
          );
        })}
      </div>

      {/* Formation Detail Modal */}
      {selectedFormation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className={`bg-gradient-to-r ${selectedFormation.color} p-6 text-white`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className={`px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold`}>
                      {getStatusBadge(selectedFormation.status).label}
                    </span>
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                      {selectedFormation.level}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold mb-2">{selectedFormation.title}</h2>
                  <p className="text-white/90 mb-4">{selectedFormation.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {selectedFormation.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen size={14} /> {selectedFormation.sessions} sessions
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={14} /> {selectedFormation.participants} participants
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFormation(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Instructor Info */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3">Formateur</h3>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                    <img src={selectedFormation.instructorPhoto} alt={selectedFormation.instructor} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-lg">{selectedFormation.instructor}</p>
                    <p className="text-sm text-gray-600">Responsable de la formation</p>
                  </div>
                </div>
              </div>

              {/* Schedule & Location */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3">Horaire et lieu</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <Calendar size={20} className="text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Horaire</p>
                      <p className="font-medium text-gray-800">{selectedFormation.schedule}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-100 rounded-xl">
                    {selectedFormation.isOnline ? <Video size={20} className="text-purple-600" /> : <FileText size={20} className="text-purple-600" />}
                    <div>
                      <p className="text-sm text-gray-600">Lieu</p>
                      <p className="font-medium text-gray-800">{selectedFormation.location}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modules/Curriculum */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3">Programme de formation</h3>
                <div className="space-y-2">
                  {selectedFormation.modules.map((module, index) => (
                    <div key={module.id} className={`flex items-center gap-3 p-3 rounded-xl border ${
                      module.completed ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        module.completed ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        {module.completed ? (
                          <CheckCircle size={16} className="text-white" />
                        ) : (
                          <span className="text-white text-sm font-bold">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${module.completed ? 'text-green-800' : 'text-gray-800'}`}>
                          {module.title}
                        </p>
                      </div>
                      {module.completed && (
                        <span className="text-xs text-green-600 font-medium">Terminé</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button className="flex-1 px-6 py-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-colors font-medium">
                  Voir les participants
                </button>
                <button className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium">
                  Modifier la formation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
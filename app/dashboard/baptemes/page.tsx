import React, { useState } from 'react';
import { Droplet, Plus, Search, Filter, Calendar, User, Phone, Mail, CheckCircle, Clock, XCircle, Eye, Edit, Download, Video, MapPin, Users, FileText } from 'lucide-react';

export default function BaptemesTab() {
  const [selectedTab, setSelectedTab] = useState('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Sample data - replace with your API calls
  const baptismStats = {
    totalBaptisms: 156,
    thisYear: 28,
    upcoming: 6,
    pendingApplications: 4,
    nextCeremony: '2026-01-18'
  };

  const candidates = [
    {
      id: 1,
      name: 'Karim Benjelloun',
      email: 'karim.b@email.com',
      phone: '+212 6XX XXX XXX',
      photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80',
      status: 'approved',
      applicationDate: '2025-12-10',
      baptismDate: '2026-01-18',
      counselor: 'Pastor Jean',
      testimony: 'J\'ai accepté Christ il y a 6 mois lors d\'un culte et ma vie a complètement changé...',
      preparationClasses: {
        completed: 4,
        total: 4
      },
      documents: ['Demande signée', 'Témoignage écrit'],
      age: 28,
      address: 'Salé, Maroc'
    },
    {
      id: 2,
      name: 'Fatima Alami',
      email: 'fatima.a@email.com',
      phone: '+212 6XX XXX XXX',
      photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
      status: 'approved',
      applicationDate: '2025-12-08',
      baptismDate: '2026-01-18',
      counselor: 'Sarah Martin',
      testimony: 'Après une longue période de recherche spirituelle, j\'ai trouvé la paix en Christ...',
      preparationClasses: {
        completed: 4,
        total: 4
      },
      documents: ['Demande signée', 'Témoignage écrit'],
      age: 32,
      address: 'Rabat, Maroc'
    },
    {
      id: 3,
      name: 'Youssef Idrissi',
      email: 'youssef.i@email.com',
      phone: '+212 6XX XXX XXX',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
      status: 'in-preparation',
      applicationDate: '2026-01-05',
      baptismDate: null,
      counselor: 'Pastor Jean',
      testimony: 'Ma rencontre avec Jésus m\'a transformé profondément...',
      preparationClasses: {
        completed: 2,
        total: 4
      },
      documents: ['Demande signée'],
      age: 25,
      address: 'Témara, Maroc'
    },
    {
      id: 4,
      name: 'Amina Rahmani',
      email: 'amina.r@email.com',
      phone: '+212 6XX XXX XXX',
      photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80',
      status: 'pending',
      applicationDate: '2026-01-08',
      baptismDate: null,
      counselor: null,
      testimony: 'Demande en attente de révision...',
      preparationClasses: {
        completed: 0,
        total: 4
      },
      documents: ['Demande signée'],
      age: 29,
      address: 'Salé, Maroc'
    },
  ];

  const upcomingCeremonies = [
    {
      id: 1,
      date: '2026-01-18',
      time: '15:00',
      location: 'Sanctuaire Principal',
      candidates: 6,
      status: 'confirmed',
      type: 'public',
      attendees: 250
    },
    {
      id: 2,
      date: '2026-02-15',
      time: '15:00',
      location: 'Sanctuaire Principal',
      candidates: 4,
      status: 'planned',
      type: 'public',
      attendees: 200
    },
  ];

  const completedBaptisms = [
    {
      id: 1,
      date: '2025-12-20',
      candidates: 8,
      location: 'Sanctuaire Principal',
      baptizer: 'Pastor Jean'
    },
    {
      id: 2,
      date: '2025-11-17',
      candidates: 5,
      location: 'Sanctuaire Principal',
      baptizer: 'Pastor Jean'
    },
    {
      id: 3,
      date: '2025-10-22',
      candidates: 7,
      location: 'Sanctuaire Principal',
      baptizer: 'Pastor David'
    },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-700 border-green-200';
      case 'in-preparation': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'completed': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'approved': return 'Approuvé';
      case 'in-preparation': return 'En préparation';
      case 'pending': return 'En attente';
      case 'completed': return 'Baptisé';
      default: return status;
    }
  };

  const filteredCandidates = candidates.filter(candidate =>
    candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const candidatesByStatus = {
    upcoming: filteredCandidates.filter(c => c.status === 'approved'),
    preparation: filteredCandidates.filter(c => c.status === 'in-preparation'),
    pending: filteredCandidates.filter(c => c.status === 'pending'),
  };

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestion des Baptêmes</h1>
          <p className="text-gray-600">Suivi des candidats et cérémonies de baptême</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm">
            <Download size={18} />
            <span className="font-medium">Exporter</span>
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/30">
            <Plus size={18} />
            <span className="font-medium">Nouvelle demande</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-sm">
          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-4">
            <Droplet size={24} className="text-white" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Total baptêmes</p>
          <p className="text-3xl font-bold text-gray-800">{baptismStats.totalBaptisms}</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100 shadow-sm">
          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30 mb-4">
            <CheckCircle size={24} className="text-white" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Cette année</p>
          <p className="text-3xl font-bold text-gray-800">{baptismStats.thisYear}</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-50 to-teal-50 rounded-2xl p-6 border border-cyan-100 shadow-sm">
          <div className="w-12 h-12 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30 mb-4">
            <Calendar size={24} className="text-white" />
          </div>
          <p className="text-gray-600 text-sm mb-1">À venir</p>
          <p className="text-3xl font-bold text-gray-800">{baptismStats.upcoming}</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100 shadow-sm">
          <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30 mb-4">
            <Clock size={24} className="text-white" />
          </div>
          <p className="text-gray-600 text-sm mb-1">En attente</p>
          <p className="text-3xl font-bold text-gray-800">{baptismStats.pendingApplications}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-6 border border-purple-100 shadow-sm">
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 mb-4">
            <Users size={24} className="text-white" />
          </div>
          <p className="text-gray-600 text-sm mb-1">Prochaine cérémonie</p>
          <p className="text-lg font-bold text-gray-800">
            {new Date(baptismStats.nextCeremony).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
          </p>
        </div>
      </div>

      {/* Upcoming Ceremonies */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar size={24} className="text-cyan-600" />
          Cérémonies prévues
        </h2>
        <div className="space-y-4">
          {upcomingCeremonies.map((ceremony) => (
            <div key={ceremony.id} className="relative overflow-hidden bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-6 border border-cyan-100 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-cyan-600">
                      {new Date(ceremony.date).getDate()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(ceremony.date).toLocaleDateString('fr-FR', { month: 'short' })}
                    </div>
                  </div>
                  <div className="h-12 w-px bg-cyan-200"></div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-800">Cérémonie de Baptême</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        ceremony.status === 'confirmed' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {ceremony.status === 'confirmed' ? 'Confirmé' : 'Planifié'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock size={14} /> {ceremony.time}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={14} /> {ceremony.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Droplet size={14} /> {ceremony.candidates} candidats
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={14} /> ~{ceremony.attendees} participants
                      </span>
                    </div>
                  </div>
                </div>
                <button className="px-6 py-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-colors font-medium shadow-lg shadow-cyan-500/30">
                  Gérer
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Candidates Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTab('upcoming')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedTab === 'upcoming'
                  ? 'bg-cyan-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Approuvés ({candidatesByStatus.upcoming.length})
            </button>
            <button
              onClick={() => setSelectedTab('preparation')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedTab === 'preparation'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              En préparation ({candidatesByStatus.preparation.length})
            </button>
            <button
              onClick={() => setSelectedTab('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedTab === 'pending'
                  ? 'bg-yellow-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              En attente ({candidatesByStatus.pending.length})
            </button>
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un candidat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent w-64"
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {candidatesByStatus[selectedTab].map((candidate) => (
            <div key={candidate.id} className="border border-gray-100 rounded-xl p-6 hover:shadow-md transition-all hover:border-cyan-300 group">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                  <img src={candidate.photo} alt={candidate.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 group-hover:text-cyan-600 transition-colors">
                        {candidate.name}
                      </h3>
                      <p className="text-sm text-gray-500">{candidate.age} ans · {candidate.address}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(candidate.status)}`}>
                      {getStatusLabel(candidate.status)}
                    </span>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={14} className="text-gray-400" />
                      <span className="truncate">{candidate.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={14} className="text-gray-400" />
                      <span>{candidate.phone}</span>
                    </div>
                    {candidate.baptismDate && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={14} className="text-gray-400" />
                        <span>Baptême: {new Date(candidate.baptismDate).toLocaleDateString('fr-FR')}</span>
                      </div>
                    )}
                    {candidate.counselor && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User size={14} className="text-gray-400" />
                        <span>Conseiller: {candidate.counselor}</span>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Classes de préparation</span>
                      <span className="font-semibold">
                        {candidate.preparationClasses.completed}/{candidate.preparationClasses.total}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all"
                        style={{ width: `${(candidate.preparationClasses.completed / candidate.preparationClasses.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSelectedCandidate(candidate)}
                      className="flex-1 px-4 py-2 bg-cyan-50 text-cyan-600 rounded-lg hover:bg-cyan-100 transition-colors font-medium flex items-center justify-center gap-2 text-sm"
                    >
                      <Eye size={16} />
                      Voir détails
                    </button>
                    <button className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                      <Edit size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completed Baptisms */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileText size={24} className="text-cyan-600" />
          Baptêmes récents
        </h2>
        <div className="space-y-3">
          {completedBaptisms.map((baptism) => (
            <div key={baptism.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Droplet size={24} className="text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    {new Date(baptism.date).toLocaleDateString('fr-FR', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {baptism.candidates} candidats · {baptism.location} · Par {baptism.baptizer}
                  </p>
                </div>
              </div>
              <button className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium">
                Voir certificats
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Candidate Detail Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 text-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl overflow-hidden border-4 border-white/20">
                    <img src={selectedCandidate.photo} alt={selectedCandidate.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{selectedCandidate.name}</h2>
                    <p className="text-cyan-100">{selectedCandidate.age} ans · {selectedCandidate.address}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCandidate(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status and Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Statut</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(selectedCandidate.status)}`}>
                    {getStatusLabel(selectedCandidate.status)}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Date de demande</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(selectedCandidate.applicationDate).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3">Coordonnées</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail size={16} className="text-gray-400" />
                    <span>{selectedCandidate.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone size={16} className="text-gray-400" />
                    <span>{selectedCandidate.phone}</span>
                  </div>
                </div>
              </div>

              {/* Preparation Progress */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3">Préparation au baptême</h3>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Classes de préparation</span>
                    <span className="text-sm font-bold text-blue-600">
                      {selectedCandidate.preparationClasses.completed}/{selectedCandidate.preparationClasses.total} complétées
                    </span>
                  </div>
                  <div className="w-full bg-blue-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all"
                      style={{ width: `${(selectedCandidate.preparationClasses.completed / selectedCandidate.preparationClasses.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Testimony */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3">Témoignage</h3>
                <div className="bg-gray-50 rounded-xl p-4 text-gray-700 italic">
                  "{selectedCandidate.testimony}"
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3">Documents</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedCandidate.documents.map((doc, index) => (
                    <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-medium flex items-center gap-1">
                      <CheckCircle size={14} />
                      {doc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Counselor */}
              {selectedCandidate.counselor && (
                <div>
                  <h3 className="font-bold text-gray-800 mb-3">Conseiller assigné</h3>
                  <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-100 rounded-xl">
                    <User size={20} className="text-purple-600" />
                    <span className="font-medium text-gray-800">{selectedCandidate.counselor}</span>
                  </div>
                </div>
              )}

              {/* Baptism Date */}
              {selectedCandidate.baptismDate && (
                <div>
                  <h3 className="font-bold text-gray-800 mb-3">Date de baptême</h3>
                  <div className="flex items-center gap-3 p-3 bg-cyan-50 border border-cyan-100 rounded-xl">
                    <Calendar size={20} className="text-cyan-600" />
                    <span className="font-medium text-gray-800">
                      {new Date(selectedCandidate.baptismDate).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                {selectedCandidate.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => handleApproveCandidate(selectedCandidate.id)}
                      className="flex-1 px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2">
                      <CheckCircle size={18} />
                      Approuver
                    </button>
                    <button 
                      onClick={() => handleRejectCandidate(selectedCandidate.id)}
                      className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors font-medium flex items-center justify-center gap-2">
                      <XCircle size={18} />
                      Refuser
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
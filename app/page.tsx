"use client";

import React, { useState } from 'react';
import { Calendar, Users, TrendingUp, Church, LogIn, Clock, MapPin, Plus, ChevronLeft, ChevronRight, Save, X } from 'lucide-react';

export default function EEAMIntranetHome() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [isMemberRegistrationOpen, setIsMemberRegistrationOpen] = useState(false);
  const [isRequestSubmissionOpen, setIsRequestSubmissionOpen] = useState(false);
  const [isPastoralMeetingOpen, setIsPastoralMeetingOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 10)); // January 10, 2026
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Sample attendance data
  const [attendanceData, setAttendanceData] = useState({
    date: '',
    culte: '',
    hommes: '',
    femmes: '',
    enfants: '',
    nouveaux: '',
    notes: ''
  });

  // Initialize date on client side
  React.useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setAttendanceData(prev => ({
      ...prev,
      date: today
    }));
  }, []);

  // Sample events
  const events = [
    {
      id: 1,
      title: 'Culte Dominical',
      date: new Date(2026, 0, 11),
      time: '10:00',
      location: 'Sanctuaire Principal',
      type: 'worship',
      color: 'bg-blue-500'
    },
    {
      id: 2,
      title: 'Cours de Discipulat',
      date: new Date(2026, 0, 14),
      time: '20:00',
      location: 'En visioconférence',
      type: 'formation',
      color: 'bg-purple-500'
    },
    {
      id: 3,
      title: 'Réunion de Prière',
      date: new Date(2026, 0, 15),
      time: '19:00',
      location: 'Salle de prière',
      type: 'prayer',
      color: 'bg-rose-500'
    },
    {
      id: 4,
      title: 'Baptême',
      date: new Date(2026, 0, 18),
      time: '15:00',
      location: 'Sanctuaire Principal',
      type: 'baptism',
      color: 'bg-cyan-500'
    },
  ];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const calendarDays = [];
  
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const [currentDateValue, setCurrentDateValue] = useState('');

  // Initialize date on client side
  React.useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setCurrentDateValue(today);
    setAttendanceData(prev => ({
      ...prev,
      date: today
    }));
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password });
    // Add your login logic here
    setIsLoginModalOpen(false);
  };

  const handleAttendanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Attendance submitted:', attendanceData);
    // Add your attendance submission logic here
    setIsAttendanceModalOpen(false);
    // Reset form
    setAttendanceData({
      date: currentDateValue,
      culte: '',
      hommes: '',
      femmes: '',
      enfants: '',
      nouveaux: '',
      notes: ''
    });
  };

  const handleAttendanceChange = (field: string, value: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-rose-600 to-rose-700 rounded-2xl flex items-center justify-center shadow-lg">
                <Church size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">EEAM_LEAD</h1>
                <p className="text-gray-600">Intranet Église Évangélique</p>
              </div>
            </div>
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/30 font-medium"
            >
              <LogIn size={20} />
              Connexion
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Users size={28} className="text-white" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Membres</p>
                <p className="text-3xl font-bold text-gray-800">342</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                <TrendingUp size={28} className="text-white" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Assiduité</p>
                <p className="text-3xl font-bold text-gray-800">87%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                <Calendar size={28} className="text-white" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Événements</p>
                <p className="text-3xl font-bold text-gray-800">24</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/30">
                <Church size={28} className="text-white" />
              </div>
              <div>
                <p className="text-gray-600 text-sm">Groupes</p>
                <p className="text-3xl font-bold text-gray-800">12</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Calendrier des Événements</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={previousMonth}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <ChevronLeft size={20} className="text-gray-600" />
                  </button>
                  <span className="text-lg font-semibold text-gray-800 min-w-[150px] text-center">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </span>
                  <button
                    onClick={nextMonth}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <ChevronRight size={20} className="text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Day Names */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }

                  const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                  const dayEvents = getEventsForDate(date);
                  const isToday = date.toDateString() === new Date(2026, 0, 10).toDateString();

                  return (
                    <div
                      key={day}
                      className={`aspect-square border rounded-xl p-2 transition-all hover:shadow-md cursor-pointer ${
                        isToday
                          ? 'bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-300 ring-2 ring-cyan-300'
                          : 'bg-white border-gray-200 hover:border-cyan-300'
                      }`}
                    >
                      <div className={`text-sm font-semibold mb-1 ${
                        isToday ? 'text-cyan-600' : 'text-gray-700'
                      }`}>
                        {day}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className={`${event.color} text-white text-xs px-1.5 py-0.5 rounded truncate`}
                            title={event.title}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-gray-500 font-medium px-1">
                            +{dayEvents.length - 2}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Attendance Input */}
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-100 shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Users size={20} className="text-rose-600" />
                Saisir l'Assiduité
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Enregistrez les présences du culte et des activités
              </p>
              <button
                onClick={() => setIsAttendanceModalOpen(true)}
                className="w-full px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-rose-500/30 font-medium"
              >
                <Plus size={20} />
                Nouvelle saisie
              </button>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar size={20} className="text-cyan-600" />
                Événements à venir
              </h3>
              <div className="space-y-3">
                {events.slice(0, 4).map(event => (
                  <div key={event.id} className="p-3 border border-gray-100 rounded-xl hover:shadow-md transition-all">
                    <div className="flex items-start gap-2">
                      <div className={`w-2 h-full ${event.color} rounded-full`}></div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 text-sm truncate">{event.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <Clock size={12} />
                          <span>{event.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} · {event.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <MapPin size={12} />
                          <span className="truncate">{event.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6 border border-cyan-100 shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Services en ligne</h3>
              <div className="space-y-2">
                <button 
                  onClick={() => setIsMemberRegistrationOpen(true)}
                  className="w-full text-left px-4 py-3 bg-white rounded-xl hover:shadow-md transition-all text-gray-700 font-medium flex items-center gap-2"
                >
                  <span className="text-xl">👤</span> Inscription Membre
                </button>
                <button 
                  onClick={() => setIsRequestSubmissionOpen(true)}
                  className="w-full text-left px-4 py-3 bg-white rounded-xl hover:shadow-md transition-all text-gray-700 font-medium flex items-center gap-2"
                >
                  <span className="text-xl">📝</span> Soumettre une Demande
                </button>
                <button 
                  onClick={() => setIsPastoralMeetingOpen(true)}
                  className="w-full text-left px-4 py-3 bg-white rounded-xl hover:shadow-md transition-all text-gray-700 font-medium flex items-center gap-2"
                >
                  <span className="text-xl">🤝</span> Entretien Pastoral
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-6 text-white rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Connexion</h2>
                  <p className="text-cyan-100">Accès à l'intranet EEAM</p>
                </div>
                <button
                  onClick={() => setIsLoginModalOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div onSubmit={handleLogin} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="votre@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                onClick={handleLogin}
                className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg shadow-cyan-500/30 font-medium"
              >
                Se connecter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {isAttendanceModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-6 text-white rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Saisir l'Assiduité</h2>
                  <p className="text-rose-100">Enregistrement des présences</p>
                </div>
                <button
                  onClick={() => setIsAttendanceModalOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div onSubmit={handleAttendanceSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={attendanceData.date}
                  onChange={(e) => handleAttendanceChange('date', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Culte Général
                  </label>
                  <input
                    type="number"
                    value={attendanceData.culte}
                    onChange={(e) => handleAttendanceChange('culte', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Nombre total"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hommes
                  </label>
                  <input
                    type="number"
                    value={attendanceData.hommes}
                    onChange={(e) => handleAttendanceChange('hommes', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Femmes
                  </label>
                  <input
                    type="number"
                    value={attendanceData.femmes}
                    onChange={(e) => handleAttendanceChange('femmes', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enfants
                  </label>
                  <input
                    type="number"
                    value={attendanceData.enfants}
                    onChange={(e) => handleAttendanceChange('enfants', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveaux visiteurs
                  </label>
                  <input
                    type="number"
                    value={attendanceData.nouveaux}
                    onChange={(e) => handleAttendanceChange('nouveaux', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  value={attendanceData.notes}
                  onChange={(e) => handleAttendanceChange('notes', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  rows={3}
                  placeholder="Remarques ou observations..."
                ></textarea>
              </div>

              <button
                onClick={handleAttendanceSubmit}
                className="w-full px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all shadow-lg shadow-rose-500/30 font-medium flex items-center justify-center gap-2"
              >
                <Save size={20} />
                Enregistrer l'assiduité
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Member Registration Modal */}
      {isMemberRegistrationOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Inscription Membre</h2>
                  <p className="text-blue-100">Rejoignez notre communauté</p>
                </div>
                <button
                  onClick={() => setIsMemberRegistrationOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Votre prénom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Votre nom"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+212 6XX XXX XXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ville, Quartier"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Comment avez-vous connu l'église?</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Votre témoignage..."
                ></textarea>
              </div>

              <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg font-medium flex items-center justify-center gap-2">
                <Save size={20} />
                Soumettre l'inscription
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Submission Modal */}
      {isRequestSubmissionOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-500 to-violet-600 p-6 text-white rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Soumettre une Demande</h2>
                  <p className="text-purple-100">Faites-nous part de vos besoins</p>
                </div>
                <button
                  onClick={() => setIsRequestSubmissionOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Votre nom</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Nom complet"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de demande</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">Sélectionner...</option>
                  <option value="prayer">Demande de prière</option>
                  <option value="baptism">Demande de baptême</option>
                  <option value="counseling">Conseil spirituel</option>
                  <option value="service">Servir dans un ministère</option>
                  <option value="other">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Détails de la demande</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={5}
                  placeholder="Décrivez votre demande en détail..."
                ></textarea>
              </div>

              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                <p className="text-sm text-purple-800">
                  ℹ️ Votre demande sera traitée par notre équipe pastorale dans les 48 heures.
                </p>
              </div>

              <button className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl hover:from-purple-600 hover:to-violet-700 transition-all shadow-lg font-medium flex items-center justify-center gap-2">
                <Save size={20} />
                Envoyer la demande
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pastoral Meeting Modal */}
      {isPastoralMeetingOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Réserver un Entretien Pastoral</h2>
                  <p className="text-green-100">Rencontrez nos pasteurs</p>
                </div>
                <button
                  onClick={() => setIsPastoralMeetingOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Votre nom</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Nom complet"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="+212 6XX XXX XXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pasteur souhaité</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">Sélectionner...</option>
                  <option value="camille">Pastor Camille (Pasteur Principal)</option>
                  <option value="jessica">Pastor Jessica</option>
                  <option value="albert">Albert (Assistant)</option>
                  <option value="any">N'importe quel pasteur disponible</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date souhaitée</label>
                <input
                  type="date"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heure préférée</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="">Sélectionner...</option>
                  <option value="morning">Matin (9h-12h)</option>
                  <option value="afternoon">Après-midi (14h-17h)</option>
                  <option value="evening">Soirée (18h-20h)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Motif de l'entretien</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={4}
                  placeholder="Décrivez brièvement le sujet que vous souhaitez aborder..."
                ></textarea>
              </div>

              <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                <p className="text-sm text-green-800">
                  🔒 Toutes les informations partagées restent confidentielles. Vous serez contacté pour confirmer le rendez-vous.
                </p>
              </div>

              <button className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg font-medium flex items-center justify-center gap-2">
                <Save size={20} />
                Réserver l'entretien
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {isAttendanceModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-rose-500 to-pink-600 p-6 text-white rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Saisir l'Assiduité</h2>
                  <p className="text-rose-100">Enregistrement des présences</p>
                </div>
                <button
                  onClick={() => setIsAttendanceModalOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div onSubmit={handleAttendanceSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={attendanceData.date}
                  onChange={(e) => handleAttendanceChange('date', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Culte Général
                  </label>
                  <input
                    type="number"
                    value={attendanceData.culte}
                    onChange={(e) => handleAttendanceChange('culte', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Nombre total"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hommes
                  </label>
                  <input
                    type="number"
                    value={attendanceData.hommes}
                    onChange={(e) => handleAttendanceChange('hommes', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Femmes
                  </label>
                  <input
                    type="number"
                    value={attendanceData.femmes}
                    onChange={(e) => handleAttendanceChange('femmes', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enfants
                  </label>
                  <input
                    type="number"
                    value={attendanceData.enfants}
                    onChange={(e) => handleAttendanceChange('enfants', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveaux visiteurs
                  </label>
                  <input
                    type="number"
                    value={attendanceData.nouveaux}
                    onChange={(e) => handleAttendanceChange('nouveaux', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  value={attendanceData.notes}
                  onChange={(e) => handleAttendanceChange('notes', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  rows={3}
                  placeholder="Remarques ou observations..."
                ></textarea>
              </div>

              <button
                onClick={handleAttendanceSubmit}
                className="w-full px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all shadow-lg shadow-rose-500/30 font-medium flex items-center justify-center gap-2"
              >
                <Save size={20} />
                Enregistrer l'assiduité
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

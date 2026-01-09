import React, { useState } from 'react';
import { Calendar, Plus, ChevronLeft, ChevronRight, Clock, MapPin, Users, Filter, Search, Eye, Edit, Trash2, Bell, Video, Download } from 'lucide-react';

export default function EventsTab() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 9)); // January 9, 2026
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Sample events data - replace with your API calls
  const events = [
    {
      id: 1,
      title: 'Culte Dominical',
      date: new Date(2026, 0, 11),
      startTime: '10:00',
      endTime: '12:30',
      location: 'Sanctuaire Principal',
      type: 'worship',
      attendees: 285,
      description: 'Culte du dimanche matin avec louange et prédication',
      isRecurring: true,
      status: 'confirmed',
      color: 'bg-blue-500'
    },
    {
      id: 2,
      title: 'Cours de Discipulat',
      date: new Date(2026, 0, 14),
      startTime: '20:00',
      endTime: '21:30',
      location: 'En visioconférence',
      type: 'formation',
      attendees: 45,
      description: 'Formation avec Jonathan Santos',
      isRecurring: true,
      status: 'confirmed',
      color: 'bg-purple-500',
      isOnline: true
    },
    {
      id: 3,
      title: 'Réunion de Prière',
      date: new Date(2026, 0, 15),
      startTime: '19:00',
      endTime: '20:30',
      location: 'Salle de prière',
      type: 'prayer',
      attendees: 62,
      description: 'Soirée de prière et intercession',
      isRecurring: true,
      status: 'confirmed',
      color: 'bg-rose-500'
    },
    {
      id: 4,
      title: 'Groupe de Jeunes',
      date: new Date(2026, 0, 17),
      startTime: '18:30',
      endTime: '20:00',
      location: 'Salle jeunesse',
      type: 'youth',
      attendees: 38,
      description: 'Rencontre hebdomadaire des jeunes',
      isRecurring: true,
      status: 'confirmed',
      color: 'bg-green-500'
    },
    {
      id: 5,
      title: 'Baptême',
      date: new Date(2026, 0, 18),
      startTime: '15:00',
      endTime: '17:00',
      location: 'Sanctuaire Principal',
      type: 'baptism',
      attendees: 12,
      description: 'Cérémonie de baptême - 6 candidats',
      isRecurring: false,
      status: 'confirmed',
      color: 'bg-cyan-500'
    },
    {
      id: 6,
      title: 'Formation Leadership',
      date: new Date(2026, 0, 20),
      startTime: '19:00',
      endTime: '21:00',
      location: 'Salle de conférence',
      type: 'formation',
      attendees: 25,
      description: 'Module 3: Gestion d\'équipe',
      isRecurring: false,
      status: 'confirmed',
      color: 'bg-amber-500'
    },
    {
      id: 7,
      title: 'Concert de Louange',
      date: new Date(2026, 0, 25),
      startTime: '19:30',
      endTime: '22:00',
      location: 'Sanctuaire Principal',
      type: 'special',
      attendees: 320,
      description: 'Concert spécial avec groupe invité',
      isRecurring: false,
      status: 'draft',
      color: 'bg-indigo-500'
    },
  ];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek, firstDay, lastDay };
  };

  const getEventsForDate = (date) => {
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

  const goToToday = () => {
    setCurrentDate(new Date(2026, 0, 9));
  };

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  
  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add the days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const getEventTypeLabel = (type) => {
    const labels = {
      worship: 'Culte',
      formation: 'Formation',
      prayer: 'Prière',
      youth: 'Jeunes',
      baptism: 'Baptême',
      special: 'Spécial'
    };
    return labels[type] || type;
  };

  const upcomingEvents = events
    .filter(e => e.date >= new Date())
    .sort((a, b) => a.date - b.date)
    .slice(0, 5);

  return (
    <div className="p-8 space-y-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gestion des Événements</h1>
          <p className="text-gray-600">Calendrier et planification des activités</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm">
            <Download size={18} />
            <span className="font-medium">Exporter</span>
          </button>
          <button className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/30">
            <Plus size={18} />
            <span className="font-medium">Nouvel événement</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button
                  onClick={goToToday}
                  className="px-4 py-1.5 bg-cyan-50 text-cyan-600 rounded-lg hover:bg-cyan-100 transition-colors text-sm font-medium"
                >
                  Aujourd'hui
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={previousMonth}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft size={20} className="text-gray-600" />
                </button>
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
                const isToday = date.toDateString() === new Date(2026, 0, 9).toDateString();
                const isPast = date < new Date(2026, 0, 9);

                return (
                  <div
                    key={day}
                    className={`aspect-square border rounded-xl p-2 transition-all hover:shadow-md cursor-pointer ${
                      isToday
                        ? 'bg-gradient-to-br from-cyan-50 to-blue-50 border-cyan-300 ring-2 ring-cyan-300'
                        : isPast
                        ? 'bg-gray-50 border-gray-100'
                        : 'bg-white border-gray-200 hover:border-cyan-300'
                    }`}
                  >
                    <div className={`text-sm font-semibold mb-1 ${
                      isToday ? 'text-cyan-600' : isPast ? 'text-gray-400' : 'text-gray-700'
                    }`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                          }}
                          className={`${event.color} text-white text-xs px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity`}
                          title={event.title}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-500 font-medium px-1">
                          +{dayEvents.length - 2} plus
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Types d'événements</h3>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm text-gray-600">Culte</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  <span className="text-sm text-gray-600">Formation</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <span className="text-sm text-gray-600">Prière</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-gray-600">Jeunes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                  <span className="text-sm text-gray-600">Baptême</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <span className="text-sm text-gray-600">Leadership</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                  <span className="text-sm text-gray-600">Spécial</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Events Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-cyan-100 text-sm">Ce mois</p>
                <p className="text-2xl font-bold">{events.length} événements</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/20">
              <span className="text-cyan-100 text-sm">Participants totaux</span>
              <span className="text-xl font-bold">{events.reduce((sum, e) => sum + e.attendees, 0)}</span>
            </div>
          </div>

          {/* Upcoming Events List */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Bell size={20} className="text-cyan-600" />
              Événements à venir
            </h3>
            <div className="space-y-3">
              {upcomingEvents.map(event => (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-all cursor-pointer hover:border-cyan-300 group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-full ${event.color} rounded-full`}></div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-800 mb-1 truncate group-hover:text-cyan-600 transition-colors">
                        {event.title}
                      </h4>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock size={12} />
                          <span>{event.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} · {event.startTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {event.isOnline ? <Video size={12} /> : <MapPin size={12} />}
                          <span className="truncate">{event.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className={`${selectedEvent.color} p-6 text-white`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold">
                    {getEventTypeLabel(selectedEvent.type)}
                  </span>
                  <h2 className="text-2xl font-bold mt-3">{selectedEvent.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-semibold text-gray-800">
                    {selectedEvent.date.toLocaleDateString('fr-FR', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Horaire</p>
                  <p className="font-semibold text-gray-800">
                    {selectedEvent.startTime} - {selectedEvent.endTime}
                  </p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-500">Lieu</p>
                <p className="font-semibold text-gray-800 flex items-center gap-2">
                  {selectedEvent.isOnline ? <Video size={16} /> : <MapPin size={16} />}
                  {selectedEvent.location}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-500">Participants attendus</p>
                <p className="font-semibold text-gray-800 flex items-center gap-2">
                  <Users size={16} />
                  {selectedEvent.attendees} personnes
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-gray-700">{selectedEvent.description}</p>
              </div>

              {selectedEvent.isRecurring && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-sm text-blue-800">
                    🔄 Cet événement se répète de façon récurrente
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button className="flex-1 px-4 py-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition-colors font-medium flex items-center justify-center gap-2">
                  <Edit size={18} />
                  Modifier
                </button>
                <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import React, { useState } from 'react';
import { Home, Droplet, HandHeart, Calendar, GraduationCap, Users, Bell, Mail, Menu, X, ChevronRight, Play, Clock, MapPin, DollarSign, UsersRound, FileText,House } from 'lucide-react';
import Link from 'next/link';
import BaptemesTab from "./baptemes/page";
import EventsTab from "./events/page";
import FinancesTab from "./finances/page";
import MembresTab from "./membres/page";
import GroupesTab from "./groupes/page";
import RapportsTab from "./rapports/page";
import AnnexeJ5Tab from "./annexe-j5/page";

const menuItems = [
  { label: 'Accueil', icon: Home, route: '/' },
  { label: 'Baptêmes', icon: Droplet, route: '/dashboard/baptemes' },
  { label: 'Événements', icon: Calendar, route: '/dashboard/events' },
  { label: 'Finance', icon: DollarSign, route: '/dashboard/finances' },
  { label: 'Formations', icon: GraduationCap, route: '/dashboard/formations' },
  { label: 'Groupes', icon: Users, route: '/dashboard/groupes' },
  { label: 'Membres', icon: UsersRound, route: '/dashboard/members' },
  { label: 'Rapports', icon: FileText, route: '/dashboard/rapports' },
  { label: 'Annexe de J5', icon: MapPin, route: '/dashboard/annexe-j5' },
];

const featuredContent = [
  {
    title: 'Formation Leadership',
    description: 'Développer les compétences de direction',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
    duration: '6 sessions',
    type: 'Formation',
    color: 'from-purple-600 to-blue-600'
  },
  {
    title: 'Gestion d\'équipe',
    description: 'Principes de management spirituel',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
    duration: '4 modules',
    type: 'Formation',
    color: 'from-rose-600 to-orange-600'
  },
];

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeItem, setActiveItem] = useState('Accueil');
  const user = { name: 'Samuel', photo_url: null };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-white shadow-2xl transition-all duration-300 z-50 ${sidebarOpen ? 'w-72' : 'w-20'}`}>
        {/* Logo */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100 bg-gradient-to-r from-rose-600 to-rose-700">
          {sidebarOpen && <span className="text-2xl font-bold text-white tracking-tight">EEAM</span>}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors text-white"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.label;
            return (
              <a
                key={item.label}
                href={item.route}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveItem(item.label);
                }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-lg shadow-cyan-500/30' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-cyan-600'
                }`}
              >
                <Icon size={20} className={`${!sidebarOpen && 'mx-auto'} transition-transform group-hover:scale-110`} />
                {sidebarOpen && (
                  <>
                    <span className="font-medium flex-1 text-left">{item.label}</span>
                    {isActive && <ChevronRight size={16} />}
                  </>
                )}
              </a>
            );
          })}
        </nav>

        {/* Footer */}
        {sidebarOpen && (
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">© EEAM 2026</p>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-72' : 'ml-20'}`}>
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-40 shadow-sm">
          <div className="h-full px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Tableau de bord
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Notifications */}
              <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
              </button>
              
              <button className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <Mail size={20} className="text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
              </button>

              {/* Profile */}
              <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-500">Leader</p>
                </div>
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-semibold shadow-lg">
                  {user.name[0]}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-8 space-y-8">
          {/* Alert */}
          {!user?.photo_url && (
            <div className="relative overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">⚠️</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 mb-1">Photo de profil manquante</h3>
                  <p className="text-amber-800 mb-3">Ajoute une photo pour personnaliser ton expérience !</p>
                  <button className="px-5 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium shadow-sm">
                    Télécharger maintenant
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Home Content */}
          {activeItem === 'Accueil' && (
            <>
              {/* Welcome Section */}
              <div className="relative overflow-hidden bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 rounded-3xl p-10 shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
                <div className="relative">
                  <p className="text-cyan-100 font-medium mb-2">Bon retour parmi nous ! 👋</p>
                  <h1 className="text-4xl font-bold text-white mb-4">
                    Espace Leadership
                  </h1>
                  <p className="text-cyan-50 text-lg max-w-2xl">
                    Gestion et supervision de l'église - Tableau de bord des leaders
                  </p>
                </div>
              </div>

              {/* Featured Content */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">Formations Leadership</h2>
                  <button className="text-cyan-600 hover:text-cyan-700 font-medium flex items-center gap-2">
                    Voir tout <ChevronRight size={16} />
                  </button>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {featuredContent.map((card, i) => (
                    <div key={i} className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                      <div className="relative h-56 overflow-hidden">
                        <img 
                          src={card.image} 
                          alt={card.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className={`absolute inset-0 bg-gradient-to-t ${card.color} opacity-60`}></div>
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-semibold text-gray-800">
                            {card.type}
                          </span>
                        </div>
                        <button className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="w-16 h-16 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-xl">
                            <Play size={24} className="text-cyan-600 ml-1" fill="currentColor" />
                          </div>
                        </button>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-cyan-600 transition-colors">
                          {card.title}
                        </h3>
                        <p className="text-gray-600 mb-4">{card.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock size={14} /> {card.duration}
                          </span>
                          <button className="text-cyan-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                            Commencer <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Upcoming Event */}
          <div className="relative overflow-hidden bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-8 border border-rose-100 shadow-sm">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Calendar size={32} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="inline-block px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-semibold mb-2">
                      Prochain événement
                    </span>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      Cours de Discipulat avec Jonathan Santos
                    </h3>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
                  <span className="flex items-center gap-2">
                    <Clock size={16} className="text-rose-500" />
                    <span className="font-medium">Dans 5 jours, 21h, 1min</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin size={16} className="text-rose-500" />
                    <span>En visioconférence</span>
                  </span>
                </div>
                <p className="text-gray-700 mb-4">Janvier 2026 à 20h | Jeudi</p>
                <button className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl hover:from-rose-600 hover:to-pink-700 transition-all font-semibold shadow-lg shadow-rose-500/30">
                  S'inscrire maintenant
                </button>
              </div>
            </div>
          </div>

          {/* Dynamic Subpage Rendering */}
          {activeItem === 'Baptêmes' && <BaptemesTab />}
          {activeItem === 'Événements' && <EventsTab />}
          {activeItem === 'Finance' && <FinancesTab />}
          {activeItem === 'Membres' && <MembresTab />}
          {activeItem === 'Groupes' && <GroupesTab />}
          {activeItem === 'Rapports' && <RapportsTab />}
          {activeItem === 'Annexe de J5' && <AnnexeJ5Tab />}
        </main>
      </div>
    </div>
  );
}
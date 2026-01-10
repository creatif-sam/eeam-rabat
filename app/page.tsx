"use client"

import React, { useState } from "react"
import {
  Calendar,
  Users,
  TrendingUp,
  LogIn,
  Clock,
  MapPin,
  Plus,
  Save,
  X
} from "lucide-react"

export default function EEAMIntranetHome() {
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* LOGO */}
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <img
                src="/images/eeam-logo.png"
                alt="EEAM Rabat"
                className="w-12 h-12 object-contain"
              />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                EEAM_LEAD
              </h1>
              <p className="text-gray-600">
                Intranet Église Évangélique
              </p>
            </div>
          </div>

          <a
            href="/auth/login"
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl flex items-center gap-2 shadow-lg"
          >
            <LogIn size={20} />
            Connexion
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            icon={<Users size={28} />}
            label="Membres"
            value="342"
            color="from-blue-500 to-indigo-600"
          />
          <StatCard
            icon={<TrendingUp size={28} />}
            label="Assiduité"
            value="87%"
            color="from-green-500 to-emerald-600"
          />
          <StatCard
            icon={<Calendar size={28} />}
            label="Événements"
            value="24"
            color="from-purple-500 to-violet-600"
          />
          <StatCard
            icon={<Users size={28} />}
            label="Groupes"
            value="12"
            color="from-rose-500 to-pink-600"
          />
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Calendrier des Événements
            </h2>
            <div className="h-96 flex items-center justify-center text-gray-400">
              Calendrier statique
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-800 mb-3">
                Saisir l'Assiduité
              </h3>
              <button
                onClick={() => setIsAttendanceModalOpen(true)}
                className="w-full px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl flex items-center justify-center gap-2 shadow-lg"
              >
                <Plus size={20} />
                Nouvelle saisie
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Événements à venir
              </h3>

              <EventItem
                title="Culte Dominical"
                date="11 Jan · 10:00"
                location="Sanctuaire Principal"
              />
              <EventItem
                title="Cours de Discipulat"
                date="14 Jan · 20:00"
                location="En visioconférence"
              />
              <EventItem
                title="Réunion de Prière"
                date="15 Jan · 19:00"
                location="Salle de prière"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Attendance Modal */}
      {isAttendanceModalOpen && (
        <Modal title="Saisir l'assiduité" onClose={() => setIsAttendanceModalOpen(false)}>
          <input className="w-full mb-3 p-3 border rounded" placeholder="Culte général" />
          <input className="w-full mb-3 p-3 border rounded" placeholder="Hommes" />
          <input className="w-full mb-3 p-3 border rounded" placeholder="Femmes" />
          <input className="w-full mb-4 p-3 border rounded" placeholder="Enfants" />

          <button className="w-full bg-rose-600 text-white py-3 rounded flex items-center justify-center gap-2">
            <Save size={18} />
            Enregistrer
          </button>
        </Modal>
      )}
    </div>
  )
}

/* ---------- Small Static Components ---------- */

function StatCard({ icon, label, value, color }: any) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border">
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-white`}>
          {icon}
        </div>
        <div>
          <p className="text-gray-600 text-sm">{label}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
      </div>
    </div>
  )
}

function EventItem({ title, date, location }: any) {
  return (
    <div className="border rounded-xl p-3 mb-3">
      <p className="font-semibold text-gray-800 text-sm">{title}</p>
      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
        <Clock size={12} />
        {date}
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
        <MapPin size={12} />
        {location}
      </div>
    </div>
  )
}

function Modal({ title, children, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

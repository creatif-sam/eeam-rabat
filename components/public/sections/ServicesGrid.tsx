"use client";

import { useState } from "react";
import { Lock, User, Heart, Users, HandHeart, FilePen, UserCheck, ClipboardList } from "lucide-react";
import PrayerRequestForm from "@/components/public/PrayerRequests";

type ServicesGridProps = {
  onMember: () => void;
  onVolunteer: () => void;
  onJoinGroup: () => void;
  onRequest: () => void;
  onPastoral: () => void;
  onAttendance: () => void;
};

export default function ServicesGrid({
  onMember,
  onVolunteer,
  onJoinGroup,
  onRequest,
  onPastoral,
  onAttendance
}: ServicesGridProps) {
  const [showPrayerForm, setShowPrayerForm] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {/* Inscription Membre */}
        <div
          onClick={onMember}
          className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all cursor-pointer group"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <User className="text-2xl text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Inscription Membre
          </h3>
          <p className="text-gray-600 text-sm">
            Rejoignez notre communauté et devenez membre officiel de l’église
          </p>
        </div>

        {/* Devenir Bénévole */}
        <div
          onClick={onVolunteer}
          className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all cursor-pointer group"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <HandHeart className="text-2xl text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Devenir Bénévole
          </h3>
          <p className="text-gray-600 text-sm">
            Servez dans un ministère et participez activement à la vie de l’église
          </p>
        </div>

        {/* Rejoindre une Commission */}
        <div
          onClick={onJoinGroup}
          className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all cursor-pointer group"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Users className="text-2xl text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Rejoindre une Commission
          </h3>
          <p className="text-gray-600 text-sm">
            Intégrez une commission ou cellule pour grandir ensemble
          </p>
        </div>

        {/* Demande de prière */}
        <div
          onClick={() => setShowPrayerForm(true)}
          className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all cursor-pointer group"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <HandHeart className="text-2xl text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Demande de prière
          </h3>
          <p className="text-gray-600 text-sm">
            Confiez vos sujets de prière à notre équipe d’intercession
          </p>
        </div>

        {/* Soumettre une Demande */}
        <div
          onClick={onRequest}
          className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all cursor-pointer group"
        >
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-amber-100 text-amber-700 text-xs px-3 py-1 rounded-full">
            <Lock size={12} />
            Réservé
          </div>

          <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FilePen className="text-2xl text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Soumettre une Demande
          </h3>
          <p className="text-gray-600 text-sm">
            Réservé aux responsables de commissions et mouvements
          </p>
        </div>

        {/* Entretien Pastoral */}
        <div
          onClick={onPastoral}
          className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all cursor-pointer group"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <UserCheck className="text-2xl text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Entretien Pastoral
          </h3>
          <p className="text-gray-600 text-sm">
            Réservez un rendez vous avec nos pasteurs
          </p>
        </div>

        {/* Assiduité */}
        <div
          onClick={onAttendance}
          className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all cursor-pointer group"
        >
          <div className="absolute top-4 right-4 flex items-center gap-1 bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-full">
            <Lock size={12} />
            Réservé
          </div>

          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <ClipboardList className="text-2xl text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Saisir l’Assiduité
          </h3>
          <p className="text-gray-600 text-sm">
            Réservé aux responsables de commissions
          </p>
        </div>
      </div>

      {/* Prayer Request Modal */}
      {showPrayerForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl relative">
            <button
              onClick={() => setShowPrayerForm(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>

            <PrayerRequestForm />
          </div>
        </div>
      )}
    </>
  );
}

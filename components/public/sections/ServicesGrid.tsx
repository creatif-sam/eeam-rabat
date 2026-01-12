"use client";

import { Users } from "lucide-react";

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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
      {/* Inscription Membre */}
      <div onClick={onMember} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all cursor-pointer group">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <i className="fa-solid fa-user text-2xl text-white"></i>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Inscription Membre</h3>
        <p className="text-gray-600 text-sm">
          Rejoignez notre communauté et devenez membre officiel de l'église
        </p>
      </div>

      {/* Devenir Bénévole */}
      <div onClick={onVolunteer} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all cursor-pointer group">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <i className="fa-solid fa-hand-holding-heart text-2xl text-white"></i>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Devenir Bénévole</h3>
        <p className="text-gray-600 text-sm">
          Servez dans un ministère et participez activement à la vie de l'église
        </p>
      </div>

      {/* Rejoindre un Groupe */}
      <div onClick={onJoinGroup} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all cursor-pointer group">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <i className="fa-solid fa-users text-2xl text-white"></i>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Rejoindre une Commission</h3>
        <p className="text-gray-600 text-sm">
          Intégrez une commission ou cellule  pour grandir ensemble
        </p>
      </div>

      {/* Demande de prière */}
      <div onClick={onRequest} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all cursor-pointer group">
        <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <i className="fa-solid fa-hands-praying text-2xl text-white"></i>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Demande de prière</h3>
        <p className="text-gray-600 text-sm">
          Confiez vos sujets de prière à notre équipe d’intercession
        </p>
      </div>

      {/* Soumettre une Demande */}
      <div onClick={onRequest} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all cursor-pointer group">
        <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <i className="fa-solid fa-file-pen text-2xl text-white"></i>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Soumettre une Demande</h3>
        <p className="text-gray-600 text-sm">
          Faites une demande de prière, baptême ou conseil spirituel
        </p>
      </div>

      {/* Entretien Pastoral */}
      <div onClick={onPastoral} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all cursor-pointer group">
        <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <i className="fa-solid fa-user-group text-2xl text-white"></i>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Entretien Pastoral</h3>
        <p className="text-gray-600 text-sm">
          Réservez un rendez vous avec nos pasteurs
        </p>
      </div>

      {/* Assiduité */}
      <div onClick={onAttendance} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all cursor-pointer group">
        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <i className="fa-solid fa-clipboard-user text-2xl text-white"></i>
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Saisir l'Assiduité</h3>
        <p className="text-gray-600 text-sm">
          Enregistrez les présences du culte  
          Accès leaders
        </p>
      </div>
    </div>
  );
}

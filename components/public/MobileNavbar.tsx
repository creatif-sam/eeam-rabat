"use client";

import { useState } from "react";
import { Home, Users, Calendar, Clock, ChevronUp, LogIn, UserPlus } from "lucide-react";

interface MobileNavbarProps {
  onNavigate?: (section: string) => void;
  onLogin?: () => void;
  onSignUp?: () => void;
  onMember?: () => void;
}

export default function MobileNavbar({ onNavigate, onLogin, onSignUp, onMember }: MobileNavbarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const navItems = [
    { id: "home", label: "Accueil", icon: Home, color: "text-blue-600" },
    { id: "enregistrement", label: "Enregistrement", icon: Users, color: "text-green-600", action: "modal" },
    { id: "calendar", label: "Calendrier", icon: Calendar, color: "text-purple-600" },
    { id: "events", label: "Événements", icon: Clock, color: "text-orange-600" }
  ];

  const handleNavigate = (sectionId: string) => {
    const item = navItems.find(item => item.id === sectionId);
    
    if (item?.action === "modal" && sectionId === "enregistrement") {
      if (onMember) onMember();
    } else if (onNavigate) {
      onNavigate(sectionId);
    } else {
      // Default scroll behavior
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
    setIsExpanded(false);
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors min-w-[60px]"
              >
                <Icon size={20} className={item.color} />
                <span className="text-xs mt-1 font-medium text-gray-600">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Expandable Quick Actions */}
        <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-32 pb-4' : 'max-h-0'}`}>
          <div className="px-4 pt-2 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  if (onLogin) onLogin();
                  setIsExpanded(false);
                }}
                className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg text-sm font-medium"
              >
                <LogIn size={16} />
                Connexion
              </button>
              <button
                onClick={() => {
                  if (onSignUp) onSignUp();
                  setIsExpanded(false);
                }}
                className="flex items-center justify-center gap-2 p-3 bg-white border-2 border-cyan-500 text-cyan-600 rounded-lg text-sm font-medium"
              >
                <UserPlus size={16} />
                S'inscrire
              </button>
            </div>
          </div>
        </div>

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center"
        >
          <ChevronUp
            size={16}
            className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {/* Bottom padding for mobile to account for navbar */}
      <div className="md:hidden h-20"></div>
    </>
  );
}
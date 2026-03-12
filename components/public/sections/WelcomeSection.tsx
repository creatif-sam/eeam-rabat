"use client";

import { useState, useEffect } from "react";

export default function WelcomeSection() {
  const [displayText, setDisplayText] = useState("Servir et Bâtir selon le modèle de Christ");
  const [isAnimating, setIsAnimating] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);

  useEffect(() => {
    const savedText = localStorage.getItem('welcome-message');
    if (savedText) setDisplayText(savedText);
    // Trigger entrance animation
    const t = setTimeout(() => setTitleVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const handleMessageUpdate = (e: CustomEvent) => {
      setIsAnimating(true);
      setTimeout(() => {
        setDisplayText(e.detail.message);
        setIsAnimating(false);
      }, 300);
    };
    window.addEventListener('welcome-message-updated', handleMessageUpdate as EventListener);
    return () => window.removeEventListener('welcome-message-updated', handleMessageUpdate as EventListener);
  }, []);

  return (
    <section className="text-center mb-12 py-6">
      {/* Animated greeting badge */}
      <div
        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest
          bg-primary/10 text-primary dark:bg-primary/20 mb-4
          transition-all duration-700 ${
            titleVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
      >
        ✨ EEAM — Paroisse de Rabat
      </div>

      {/* Main animated title */}
      <h2
        className={`text-4xl sm:text-5xl font-black text-gray-900 dark:text-white mb-4 leading-tight
          transition-all duration-700 delay-100 ${
            titleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
      >
        Bienvenue à l&apos;{" "}
        <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
          EEAM-RABAT LEAD
        </span>
      </h2>

      {/* Animated subtitle */}
      <div
        className={`relative overflow-hidden transition-all duration-700 delay-200 ${
          titleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <p
          className={`text-lg sm:text-xl text-gray-600 dark:text-gray-300 transition-all duration-500 ease-in-out font-medium ${
            isAnimating ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
          }`}
        >
          {displayText}
        </p>
        <div
          className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 rounded-full transition-all duration-1000 ease-out ${
            isAnimating ? "w-0" : "w-3/4"
          }`}
          style={{ transitionDelay: isAnimating ? "0ms" : "400ms" }}
        />
      </div>

      {/* Decorative dots */}
      <div
        className={`flex justify-center gap-2 mt-6 transition-all duration-700 delay-300 ${
          titleVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-cyan-400" />
        <span className="w-2 h-2 rounded-full bg-blue-500" />
        <span className="w-2 h-2 rounded-full bg-indigo-500" />
      </div>
    </section>
  );
}

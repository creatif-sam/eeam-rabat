"use client";

import { useState, useEffect } from "react";

export default function WelcomeSection() {
  const [displayText, setDisplayText] = useState("Servir et Bâtir selon le modèle de Christ");
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Load text from localStorage or use default
    const savedText = localStorage.getItem('welcome-message');
    if (savedText) {
      setDisplayText(savedText);
    }
  }, []);

  // Listen for custom event from dashboard
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
    <section className="text-center mb-12">
      <h2 className="text-4xl font-bold text-gray-800 mb-3">
        Bienvenue à l'EEAM-RABAT LEAD
      </h2>
      <div className="relative overflow-hidden">
        <p
          className={`text-xl text-gray-600 transition-all duration-500 ease-in-out ${
            isAnimating
              ? 'opacity-0 transform translate-y-2'
              : 'opacity-100 transform translate-y-0'
          }`}
        >
          {displayText}
        </p>
        <div
          className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-700 ease-out ${
            isAnimating ? 'w-0' : 'w-full'
          }`}
          style={{ transitionDelay: isAnimating ? '0ms' : '300ms' }}
        ></div>
      </div>
    </section>
  );
}

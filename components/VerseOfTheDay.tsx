"use client";

import { useEffect, useState } from "react";
import { BookOpen, Quote, X } from "lucide-react";

type Verse = {
  text: string;
  reference: string;
};

export default function VerseOfTheDay() {
  const [verse, setVerse] = useState<Verse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClosed, setIsClosed] = useState(false);

  useEffect(() => {
    // Check if user has closed the popup today
    const today = new Date().toDateString();
    const closedDate = localStorage.getItem('verseOfDayClosed');
    if (closedDate === today) {
      setIsClosed(true);
      return;
    }

    const fetchVerse = async () => {
      try {
        const res = await fetch(
          "https://bible-api.com/?translation=ls1910&random=verse"
        );
        const data = await res.json();

        setVerse({
          text: data.text.trim(),
          reference: data.reference
        });
      } catch (error) {
        setVerse({
          text:
            "Ainsi, soit que vous mangiez, soit que vous buviez, soit que vous fassiez quelque chose, faites tout pour la gloire de Dieu.",
          reference: "1 Corinthiens 10:31"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVerse();
  }, []);

  const handleClose = () => {
    setIsClosed(true);
    const today = new Date().toDateString();
    localStorage.setItem('verseOfDayClosed', today);
  };

  if (loading) {
    return (
      <div className="fixed bottom-4 right-4 z-40 max-w-xs bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-4 text-sm text-gray-500">
        Chargement du verset du jour…
      </div>
    );
  }

  if (!verse || isClosed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-xs bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-4">
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
        aria-label="Fermer le verset du jour"
      >
        <X size={14} className="text-gray-600" />
      </button>

      <div className="flex items-start gap-3 pr-8">
        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
          <BookOpen size={16} className="text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Quote size={14} className="text-cyan-600" />
            <span className="text-xs font-semibold text-cyan-600 uppercase tracking-wide">
              Verset du jour
            </span>
          </div>

          <blockquote className="text-sm text-gray-700 leading-relaxed mb-2 italic">
            "{verse.text}"
          </blockquote>

          <cite className="text-xs text-gray-500 font-medium">
            {verse.reference}
          </cite>
        </div>
      </div>
    </div>
  );
}

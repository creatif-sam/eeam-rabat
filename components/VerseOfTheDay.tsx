"use client";

import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";

type Verse = { text: string; reference: string };

/** Louis Segond 1910 (public domain). One verse per day, same for every visitor. */
const VERSES: Verse[] = [
  { reference: "Jean 3:16", text: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu'il ait la vie éternelle." },
  { reference: "Psaume 23:1", text: "L'Éternel est mon berger : je ne manquerai de rien." },
  { reference: "Philippiens 4:13", text: "Je puis tout par celui qui me fortifie." },
  { reference: "Proverbes 3:5", text: "Confie-toi en l'Éternel de tout ton cœur, et ne t'appuie pas sur ta sagesse." },
  { reference: "Ésaïe 41:10", text: "Ne crains rien, car je suis avec toi ; ne promène pas des regards inquiets, car je suis ton Dieu ; je te fortifie, je viens à ton secours, je te soutiens de ma droite triomphante." },
  { reference: "Romains 8:28", text: "Nous savons, du reste, que toutes choses concourent au bien de ceux qui aiment Dieu, de ceux qui sont appelés selon son dessein." },
  { reference: "Jérémie 29:11", text: "Car je connais les projets que j'ai formés sur vous, dit l'Éternel, projets de paix et non de malheur, afin de vous donner un avenir et de l'espérance." },
  { reference: "Matthieu 11:28", text: "Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos." },
  { reference: "Josué 1:9", text: "Fortifie-toi et prends courage ! Ne t'effraie point et ne t'épouvante point, car l'Éternel, ton Dieu, est avec toi dans tout ce que tu entreprendras." },
  { reference: "Jean 14:6", text: "Jésus lui dit : Je suis le chemin, la vérité, et la vie. Nul ne vient au Père que par moi." },
  { reference: "Philippiens 4:6", text: "Ne vous inquiétez de rien ; mais en toute chose faites connaître vos besoins à Dieu par des prières et des supplications, avec des actions de grâces." },
  { reference: "1 Corinthiens 10:31", text: "Soit donc que vous mangiez, soit que vous buviez, soit que vous fassiez quelque autre chose, faites tout pour la gloire de Dieu." },
  { reference: "Psaume 119:105", text: "Ta parole est une lampe à mes pieds, et une lumière sur mon sentier." },
  { reference: "Matthieu 6:33", text: "Cherchez premièrement le royaume et la justice de Dieu ; et toutes ces choses vous seront données par-dessus." },
  { reference: "Ésaïe 40:31", text: "Mais ceux qui se confient en l'Éternel renouvellent leur force. Ils prennent le vol comme les aigles ; ils courent, et ne se lassent point, ils marchent, et ne se fatiguent point." },
  { reference: "Romains 12:2", text: "Ne vous conformez pas au siècle présent, mais soyez transformés par le renouvellement de l'intelligence, afin que vous discerniez quelle est la volonté de Dieu, ce qui est bon, agréable et parfait." },
  { reference: "Hébreux 11:1", text: "Or la foi est une ferme assurance des choses qu'on espère, une démonstration de celles qu'on ne voit pas." },
  { reference: "Psaume 37:5", text: "Recommande ton sort à l'Éternel, mets en lui ta confiance, et il agira." },
  { reference: "2 Timothée 1:7", text: "Car ce n'est pas un esprit de timidité que Dieu nous a donné, mais un esprit de force, d'amour et de sagesse." },
  { reference: "Lamentations 3:22-23", text: "Les bontés de l'Éternel ne sont pas épuisées, ses compassions ne sont pas à leur terme ; elles se renouvellent chaque matin. Oh ! que ta fidélité est grande !" },
  { reference: "Matthieu 5:14", text: "Vous êtes la lumière du monde. Une ville située sur une montagne ne peut être cachée." },
  { reference: "Jean 15:5", text: "Je suis le cep, vous êtes les sarments. Celui qui demeure en moi et en qui je demeure porte beaucoup de fruit, car sans moi vous ne pouvez rien faire." },
  { reference: "1 Jean 4:19", text: "Pour nous, nous l'aimons, parce qu'il nous a aimés le premier." },
  { reference: "Romains 15:13", text: "Que le Dieu de l'espérance vous remplisse de toute joie et de toute paix dans la foi, pour que vous abondiez en espérance, par la puissance du Saint-Esprit !" },
  { reference: "Michée 6:8", text: "On t'a fait connaître, ô homme, ce qui est bien ; et ce que l'Éternel demande de toi, c'est que tu pratiques la justice, que tu aimes la miséricorde, et que tu marches humblement avec ton Dieu." },
  { reference: "Colossiens 3:23", text: "Tout ce que vous faites, faites-le de bon cœur, comme pour le Seigneur et non pour des hommes." },
  { reference: "Nombres 6:24-26", text: "Que l'Éternel te bénisse, et qu'il te garde ! Que l'Éternel fasse luire sa face sur toi, et qu'il t'accorde sa grâce ! Que l'Éternel tourne sa face vers toi, et qu'il te donne la paix !" },
  { reference: "Hébreux 11:6", text: "Or sans la foi il est impossible de lui être agréable ; car il faut que celui qui s'approche de Dieu croie que Dieu existe, et qu'il est le rémunérateur de ceux qui le cherchent." },
];

function verseFor(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
  return VERSES[(dayOfYear + date.getFullYear()) % VERSES.length];
}

/** Inline "verse of the day" band for the homepage. */
export default function VerseOfTheDay() {
  // Chosen after mount so the visitor's own date is used (no hydration mismatch)
  const [verse, setVerse] = useState<Verse | null>(null);
  useEffect(() => setVerse(verseFor(new Date())), []);

  return (
    <section
      aria-label="Verset du jour"
      className="relative overflow-hidden rounded-2xl border border-cyan-100 dark:border-cyan-900/50 bg-gradient-to-r from-cyan-50 via-white to-blue-50 dark:from-cyan-950/40 dark:via-gray-900 dark:to-blue-950/40 px-5 py-5 sm:px-8 sm:py-6 mb-10 sm:mb-12"
    >
      <span aria-hidden className="pointer-events-none absolute -right-2 -top-6 select-none font-serif text-[7rem] leading-none text-cyan-600/10 dark:text-cyan-300/10">
        «
      </span>
      <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-600 text-white">
            <BookOpen size={18} />
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-cyan-700 dark:text-cyan-300">Verset du jour</span>
        </div>
        <span className="hidden sm:block h-10 w-px bg-cyan-200 dark:bg-cyan-800" aria-hidden />
        {verse ? (
          <figure className="min-w-0 flex-1">
            <blockquote className="text-[15px] sm:text-base italic leading-relaxed text-gray-800 dark:text-gray-100">
              « {verse.text} »
            </blockquote>
            <figcaption className="mt-1.5 text-xs font-semibold uppercase tracking-wide text-cyan-700 dark:text-cyan-300">
              {verse.reference}
            </figcaption>
          </figure>
        ) : (
          <div className="flex-1 space-y-2" aria-hidden>
            <div className="h-4 w-11/12 rounded bg-cyan-100/70 dark:bg-cyan-900/40" />
            <div className="h-4 w-2/3 rounded bg-cyan-100/70 dark:bg-cyan-900/40" />
          </div>
        )}
      </div>
    </section>
  );
}

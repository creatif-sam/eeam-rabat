import { Suspense } from "react";
import HomePage from "@/components/HomePage";
import VerseOfTheDay from "@/components/VerseOfTheDay";

export const metadata = {
  title: "EEAM Rabat - Église Évangélique Au Maroc",
  description:
    "Site de la paroisse EEAM Rabat : services, événements, formations, entretiens pastoraux et inscription des membres."
};

export default function EEAMIntranetHome() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePage />
      <VerseOfTheDay />
    </Suspense>
  );
}

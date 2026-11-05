import { Suspense } from "react";
import HomePage from "@/components/HomePage";
import BrandedLoader from "@/components/BrandedLoader";

export const metadata = {
  title: "EEAM Rabat - Église Évangélique Au Maroc",
  description:
    "La plateforme de la paroisse EEAM de Rabat : calendrier des cultes et activités, annonces, inscription des membres, demandes de prière, entretiens pastoraux et espace des responsables."
};

export default function EEAMIntranetHome() {
  return (
    <Suspense fallback={<BrandedLoader />}>
      <HomePage />
    </Suspense>
  );
}

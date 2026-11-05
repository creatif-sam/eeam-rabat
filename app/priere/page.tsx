import type { Metadata } from "next";
import PrayerRequestPage from "./PrayerRequestPage";

export const metadata: Metadata = {
  title: "Demande de prière – EEAM Rabat",
  description:
    "Confiez vos sujets de prière à l'équipe d'intercession de l'Église Évangélique Au Maroc – paroisse de Rabat.",
};

export default function DemandeDePriereRoute() {
  return <PrayerRequestPage />;
}

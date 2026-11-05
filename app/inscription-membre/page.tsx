import type { Metadata } from "next";
import MemberRegistrationPage from "./MemberRegistrationPage";

export const metadata: Metadata = {
  title: "Inscription membre – EEAM Rabat",
  description:
    "Rejoignez la communauté de l'Église Évangélique Au Maroc – paroisse de Rabat. Inscrivez-vous comme membre en quelques minutes.",
};

export default function InscriptionMembreRoute() {
  return <MemberRegistrationPage />;
}

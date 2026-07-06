import PrivacyPolicy from "@/components/public/PrivacyPolicy";
import SiteLayout from "@/components/public/layout/SiteLayout";

export const metadata = {
  title: "Politique de confidentialité – EEAM Rabat",
  description: "Comment l'EEAM Rabat protège et utilise les données personnelles de ses membres et visiteurs."
};

export default function PrivacyPolicyPage() {
  return (
    <SiteLayout>
      <PrivacyPolicy />
    </SiteLayout>
  );
}

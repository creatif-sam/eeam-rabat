import { Suspense } from "react";
import ProfileSetupWrapper from "./ProfileSetupWrapper";
import BrandedLoader from "@/components/BrandedLoader";

export default function ProfileSetupPage() {
  return (
    <Suspense fallback={<BrandedLoader />}>
      <ProfileSetupWrapper />
    </Suspense>
  );
}

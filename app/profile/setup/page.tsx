import { Suspense } from "react";
import ProfileSetupWrapper from "./ProfileSetupWrapper";

export default function ProfileSetupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>}>
      <ProfileSetupWrapper />
    </Suspense>
  );
}

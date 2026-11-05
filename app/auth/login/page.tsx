import { Suspense } from "react";
import AuthGate from "./AuthGate";
import BrandedLoader from "@/components/BrandedLoader";

export default function Page() {
  return (
    <Suspense fallback={<BrandedLoader />}>
      <AuthGate />
    </Suspense>
  );
}

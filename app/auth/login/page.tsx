import { Suspense } from "react";
import AuthGate from "./AuthGate";

export default function Page() {
  return (
    <Suspense fallback={<div className="flex min-h-svh w-full items-center justify-center">Loading...</div>}>
      <AuthGate />
    </Suspense>
  );
}

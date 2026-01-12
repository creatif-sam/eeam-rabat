import { Suspense } from "react";
import HomePage from "@/components/HomePage";
import VerseOfTheDay from "@/components/VerseOfTheDay";

export default function EEAMIntranetHome() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePage />
      <VerseOfTheDay />
    </Suspense>
  );
}

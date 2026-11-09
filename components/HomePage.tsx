"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Header from "@/components/public/layout/Header";
import HeroCarousel from "@/components/public/sections/HeroCarousel";
import VerseOfTheDay from "@/components/VerseOfTheDay";
import ServicesGrid from "@/components/public/sections/ServicesGrid";
import EventsSection from "@/components/public/sections/EventsSection";
import MobileNavbar from "@/components/public/MobileNavbar";
import Footer from "@/components/public/Footer";
import BaseModal from "@/components/modals/BaseModal";

import VolunteerForm from "@/components/public/VolunteerForm";
import RequestSubmissionForm from "@/components/public/RequestSubmissionForm";
import AttendanceForm from "@/components/public/AttendanceForm";
import PublicCalendar from "@/components/public/PublicCalender";

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [volunteerOpen, setVolunteerOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);

  useEffect(() => {
    const modal = searchParams.get('modal');
    if (modal === 'login') {
      router.replace("/auth/login");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div id="home">
          <HeroCarousel />
        </div>

        <VerseOfTheDay />

        <div id="services">
          <ServicesGrid
            onMember={() => router.push("/inscription-membre")}
            onVolunteer={() => setVolunteerOpen(true)}
            onRequest={() => setRequestOpen(true)}
            onAttendance={() => setAttendanceOpen(true)}
          />
        </div>

        <div id="calendar" className="rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800 mb-8">
          <PublicCalendar />
        </div>

        <div id="events">
          <EventsSection />
        </div>

      </main>

      <BaseModal
        open={volunteerOpen}
        onClose={() => setVolunteerOpen(false)}
        title="Devenir Bénévole"
        subtitle="Servez dans un ministère"
        headerClass="bg-gradient-to-r from-green-500 to-emerald-600"
      >
        <VolunteerForm />
      </BaseModal>

      <BaseModal
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        title="Soumettre une Demande"
        subtitle="Budget, prière, matériel"
        headerClass="bg-gradient-to-r from-purple-500 to-violet-600"
      >
        <RequestSubmissionForm />
      </BaseModal>

      <BaseModal
        open={attendanceOpen}
        onClose={() => setAttendanceOpen(false)}
        title="Saisir l'Assiduité"
        subtitle="Accès leaders"
        headerClass="bg-gradient-to-r from-rose-500 to-pink-600"
      >
        <AttendanceForm />
      </BaseModal>

      <MobileNavbar
        onNavigate={(section) => {
          const element = document.getElementById(section);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }}
        onMember={() => router.push("/inscription-membre")}
      />

      <Footer />
    </div>
  );
}
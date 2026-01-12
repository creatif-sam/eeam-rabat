"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import Header from "@/components/public/layout/Header";
import WelcomeSection from "@/components/public/sections/WelcomeSection";
import ServicesGrid from "@/components/public/sections/ServicesGrid";
import EventsSection from "@/components/public/sections/EventsSection";
import BaseModal from "@/components/modals/BaseModal";

import MemberRegistrationForm from "@/components/public/MemberRegistrationForm";
import VolunteerForm from "@/components/public/VolunteerForm";
import JoinGroupForm from "@/components/public/JoinCommission";
import RequestSubmissionForm from "@/components/public/RequestSubmissionForm";
import PastoralMeetingForm from "@/components/public/CounsellingBooking";
import AttendanceForm from "@/components/public/AttendanceForm";
import PublicCalendar from "@/components/public/PublicCalender";
import { LoginForm } from "@/components/login-form";
import { SignUpForm } from "@/components/sign-up-form";

export default function HomePage() {
  const searchParams = useSearchParams();
  const [loginOpen, setLoginOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [memberOpen, setMemberOpen] = useState(false);
  const [volunteerOpen, setVolunteerOpen] = useState(false);
  const [joinGroupOpen, setJoinGroupOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [pastoralOpen, setPastoralOpen] = useState(false);
  const [attendanceOpen, setAttendanceOpen] = useState(false);

  useEffect(() => {
    const modal = searchParams.get('modal');
    if (modal === 'login') {
      setLoginOpen(true);
    } else if (modal === 'signup') {
      setSignUpOpen(true);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header onLogin={() => setLoginOpen(true)} onSignUp={() => setSignUpOpen(true)} />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <WelcomeSection />

        <ServicesGrid
          onMember={() => setMemberOpen(true)}
          onVolunteer={() => setVolunteerOpen(true)}
          onJoinGroup={() => setJoinGroupOpen(true)}
          onRequest={() => setRequestOpen(true)}
          onPastoral={() => setPastoralOpen(true)}
          onAttendance={() => setAttendanceOpen(true)}
        />

        <PublicCalendar />
        <EventsSection />

      </main>

      <BaseModal
        open={memberOpen}
        onClose={() => setMemberOpen(false)}
        title="Inscription Membre"
        subtitle="Rejoignez notre communauté"
        headerClass="bg-gradient-to-r from-blue-500 to-indigo-600"
      >
        <MemberRegistrationForm />
      </BaseModal>

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
        open={joinGroupOpen}
        onClose={() => setJoinGroupOpen(false)}
        title="Rejoindre un Groupe"
        subtitle="Cellules et commissions"
        headerClass="bg-gradient-to-r from-purple-500 to-violet-600"
      >
        <JoinGroupForm />
      </BaseModal>

      <BaseModal
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        title="Soumettre une Demande"
        subtitle="Prière, baptême, accompagnement"
        headerClass="bg-gradient-to-r from-purple-500 to-violet-600"
      >
        <RequestSubmissionForm />
      </BaseModal>

      <BaseModal
        open={pastoralOpen}
        onClose={() => setPastoralOpen(false)}
        title="Entretien Pastoral"
        subtitle="Rencontrez nos pasteurs"
        headerClass="bg-gradient-to-r from-green-500 to-emerald-600"
      >
        <PastoralMeetingForm />
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

      <BaseModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        title="Connexion"
        subtitle="Accédez à votre compte"
        headerClass="bg-gradient-to-r from-cyan-500 to-blue-600"
      >
        <LoginForm />
      </BaseModal>

      <BaseModal
        open={signUpOpen}
        onClose={() => setSignUpOpen(false)}
        title="Créer un compte"
        subtitle="Rejoignez notre communauté"
        headerClass="bg-gradient-to-r from-green-500 to-emerald-600"
      >
        <SignUpForm />
      </BaseModal>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import MemberRegistrationForm from "@/components/public/MemberRegistrationForm";

export default function EditMemberPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const memberId = params.id as string;

  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMember = async () => {
      const { data, error } = await supabase
        .from("member_registrations")
        .select("*")
        .eq("id", memberId)
        .single();

      if (!error && data) {
        setMember(data);
      }

      setLoading(false);
    };

    fetchMember();
  }, [memberId]);

  if (loading) {
    return <div className="p-8">Chargement du membre...</div>;
  }

  if (!member) {
    return <div className="p-8 text-red-600">Membre introuvable</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Modifier le membre</h1>
        <p className="text-gray-600">
          {member.prenom} {member.nom}
        </p>
      </div>

      <MemberRegistrationForm
        isEdit
        initialData={member}
        onSuccess={() => router.push("/dashboard/membres")}
      />
    </div>
  );
}

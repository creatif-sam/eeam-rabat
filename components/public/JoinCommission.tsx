"use client";

import { useEffect, useState } from "react";
import { Users, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Group = {
  id: string;
  name: string;
};

export default function GroupJoinForm() {
  const supabase = createClient();

  const [groups, setGroups] = useState<Group[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    group_id: "",
    motivation: ""
  });

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    const { data } = await supabase
      .from("groupes_commissions")
      .select("id,name")
      .eq("active", true)
      .order("name");

    setGroups(data || []);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from("group_join_requests")
      .insert({
        full_name: form.full_name,
        phone: form.phone,
        email: form.email || null,
        group_id: form.group_id,
        motivation: form.motivation
      });

    if (!error) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center space-y-3">
        <CheckCircle className="mx-auto text-green-600" size={40} />
        <h3 className="text-lg font-semibold text-green-800">
          Demande envoyée
        </h3>
        <p className="text-sm text-green-700">
          Votre demande a bien été transmise.  
          Vous serez contacté après étude par le responsable du groupe.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex gap-3 bg-cyan-50 border border-cyan-200 rounded-xl p-4">
        <Users className="text-cyan-600 mt-0.5" size={20} />
        <div className="text-sm text-cyan-800">
          <p className="font-semibold">Rejoindre un groupe ou une commission</p>
          <p>
            Engagez vous dans un service et participez activement à la vie de l église
          </p>
        </div>
      </div>

      <input
        name="full_name"
        value={form.full_name}
        onChange={handleChange}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
        placeholder="Nom complet"
        required
      />

      <input
        name="phone"
        value={form.phone}
        onChange={handleChange}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
        placeholder="Téléphone"
        required
      />

      <input
        name="email"
        type="email"
        value={form.email}
        onChange={handleChange}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
        placeholder="Email"
      />

      <select
        name="group_id"
        value={form.group_id}
        onChange={handleChange}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
        required
      >
        <option value="">Groupe ou commission souhaité</option>
        {groups.map(g => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>

      <textarea
        name="motivation"
        rows={4}
        value={form.motivation}
        onChange={handleChange}
        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500"
        placeholder="Pourquoi souhaitez vous rejoindre ce groupe"
        required
      />

      <button
        type="submit"
        className="w-full px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 transition shadow-lg"
      >
        Envoyer la demande
      </button>
    </form>
  );
}

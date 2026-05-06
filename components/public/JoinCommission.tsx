"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

type Group = { id: string; name: string; };

const inputClass = "w-full px-4 py-3 rounded-xl border transition-all focus:outline-none focus:ring-2 " +
  "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 " +
  "border-gray-200 dark:border-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 " +
  "focus:ring-cyan-500 dark:focus:ring-cyan-400";

const labelClass = "block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1.5";

export default function GroupJoinForm() {
  const supabase = createClient();
  const [groups, setGroups] = useState<Group[]>([]);

  const [form, setForm] = useState({
    full_name: "", phone: "", email: "", group_id: "", motivation: ""
  });

  useEffect(() => { loadGroups(); }, []);

  const loadGroups = async () => {
    const { data } = await supabase.from("groupes_commissions").select("id,name").eq("active", true).order("name");
    setGroups(data || []);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("group_join_requests").insert({
      full_name: form.full_name,
      phone: form.phone,
      email: form.email || null,
      group_id: form.group_id,
      motivation: form.motivation
    });
    if (error) {
      toast.error("Une erreur est survenue. Veuillez réessayer.");
      return;
    }
    toast.success("Demande envoyée ! Vous serez contacté par le responsable du groupe.");
    setForm({ full_name: "", phone: "", email: "", group_id: "", motivation: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex gap-3 bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl p-4">
        <Users className="text-cyan-600 dark:text-cyan-400 mt-0.5" size={20} />
        <div className="text-sm text-cyan-800 dark:text-cyan-300">
          <p className="font-semibold">Rejoindre un groupe ou une commission</p>
          <p>Engagez-vous dans un service et participez activement à la vie de l’église</p>
        </div>
      </div>

      <div>
        <label className={labelClass}>Nom complet *</label>
        <input name="full_name" value={form.full_name} onChange={handleChange}
          className={inputClass} placeholder="Jean Dupont" required />
      </div>
      <div>
        <label className={labelClass}>Téléphone *</label>
        <input name="phone" value={form.phone} onChange={handleChange}
          className={inputClass} placeholder="+212 6XX XXX XXX" required />
      </div>
      <div>
        <label className={labelClass}>Email <span className="font-normal text-gray-500 dark:text-gray-400">(optionnel)</span></label>
        <input name="email" type="email" value={form.email} onChange={handleChange}
          className={inputClass} placeholder="email@exemple.com" />
      </div>

      <div>
        <label className={labelClass}>Groupe ou commission souhaité *</label>
        <select name="group_id" value={form.group_id} onChange={handleChange}
          className={inputClass} required>
          <option value="">Sélectionner un groupe</option>
          {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
      </div>

      <div>
        <label className={labelClass}>Motivation *</label>
        <textarea name="motivation" rows={4} value={form.motivation} onChange={handleChange}
          className={inputClass} placeholder="Pourquoi souhaitez-vous rejoindre ce groupe" required />
      </div>

      <button type="submit"
        className="w-full px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-600 hover:to-blue-700 transition shadow-lg">
        Envoyer la demande
      </button>
    </form>
  );
}

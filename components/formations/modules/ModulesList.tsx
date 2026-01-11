"use client";

import { useEffect, useState } from "react";
import { Plus, Edit, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import CreateModuleModal from "./CreateModuleModal";
import EditModuleModal from "./EditModuleModal";

type Module = {
  id: string;
  titre: string;
  description: string | null;
  ordre: number;
  est_complete: boolean;
};

export default function ModulesList({ formationId }: { formationId: string }) {
  const supabase = createClient();
  const [modules, setModules] = useState<Module[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Module | null>(null);

  const load = async () => {
    const { data } = await supabase
      .from("formation_modules")
      .select("*")
      .eq("formation_id", formationId)
      .order("ordre");
    setModules(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-gray-800">Modules de formation</h3>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-3 py-2 bg-cyan-500 text-white rounded-xl"
        >
          <Plus size={16} />
          Ajouter
        </button>
      </div>

      {modules.map(m => (
        <div
          key={m.id}
          className="flex items-center justify-between p-3 border rounded-xl"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
              {m.est_complete ? (
                <CheckCircle size={16} className="text-green-500" />
              ) : (
                <span className="text-sm font-bold">{m.ordre}</span>
              )}
            </div>
            <div>
              <p className="font-medium">{m.titre}</p>
              {m.description && (
                <p className="text-sm text-gray-500">{m.description}</p>
              )}
            </div>
          </div>

          <button onClick={() => setEditing(m)}>
            <Edit size={16} />
          </button>
        </div>
      ))}

      <CreateModuleModal
        open={createOpen}
        formationId={formationId}
        onClose={() => setCreateOpen(false)}
        onCreated={load}
      />

      <EditModuleModal
        module={editing}
        onClose={() => setEditing(null)}
        onUpdated={load}
      />
    </div>
  );
}

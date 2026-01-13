"use client";

import { useEffect, useState } from "react";
import { Plus, Calendar } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Modal from "@/components/dashboard/Modal";

type TaskStatus = "backlog" | "in_progress" | "review" | "done";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: "low" | "medium" | "high";
  due_date: string | null;
}

const colonnes: { key: TaskStatus; label: string }[] = [
  { key: "backlog", label: "À faire" },
  { key: "in_progress", label: "En cours" },
  { key: "review", label: "En révision" },
  { key: "done", label: "Terminé" }
];

export default function TaskyTab() {
  const supabase = createClient();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    status: "backlog" as TaskStatus,
    priority: "medium" as "low" | "medium" | "high",
    due_date: ""
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks() {
    setLoading(true);
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: true });

    setTasks(data || []);
    setLoading(false);
  }

  async function createTask() {
    if (!form.title) return;

    await supabase.from("tasks").insert({
      title: form.title,
      description: form.description,
      status: form.status,
      priority: form.priority,
      due_date: form.due_date || null
    });

    setOpen(false);
    setForm({
      title: "",
      description: "",
      status: "backlog",
      priority: "medium",
      due_date: ""
    });

    fetchTasks();
  }

  async function moveTask(taskId: string, status: TaskStatus) {
    await supabase.from("tasks").update({ status }).eq("id", taskId);
    fetchTasks();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tableau de planification Tasky</h1>

        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-white"
        >
          <Plus size={18} />
          Nouvelle tâche
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Chargement des tâches</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {colonnes.map(colonne => (
            <div
              key={colonne.key}
              className="rounded-xl border bg-background p-3"
            >
              <h2 className="mb-3 font-medium">{colonne.label}</h2>

              <div className="space-y-3">
                {tasks
                  .filter(t => t.status === colonne.key)
                  .map(task => (
                    <div
                      key={task.id}
                      className="rounded-lg border bg-card p-3 shadow-sm"
                    >
                      <p className="font-medium">{task.title}</p>

                      {task.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {task.description}
                        </p>
                      )}

                      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                        <span className="capitalize">
                          Priorité {task.priority}
                        </span>

                        {task.due_date && (
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            Échéance {task.due_date}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {colonnes
                          .filter(c => c.key !== colonne.key)
                          .map(c => (
                            <button
                              key={c.key}
                              onClick={() => moveTask(task.id, c.key)}
                              className="rounded bg-muted px-2 py-1 text-xs"
                            >
                              {c.label}
                            </button>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Créer une tâche"
      >
        <div className="space-y-4">
          <input
            className="w-full rounded border px-3 py-2"
            placeholder="Titre de la tâche"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
          />

          <textarea
            className="w-full rounded border px-3 py-2"
            placeholder="Description"
            value={form.description}
            onChange={e =>
              setForm({ ...form, description: e.target.value })
            }
          />

          <select
            className="w-full rounded border px-3 py-2"
            value={form.priority}
            onChange={e =>
              setForm({
                ...form,
                priority: e.target.value as any
              })
            }
          >
            <option value="low">Priorité basse</option>
            <option value="medium">Priorité moyenne</option>
            <option value="high">Priorité élevée</option>
          </select>

          <input
            type="date"
            className="w-full rounded border px-3 py-2"
            value={form.due_date}
            onChange={e =>
              setForm({ ...form, due_date: e.target.value })
            }
          />

          <button
            onClick={createTask}
            className="w-full rounded bg-primary py-2 text-white"
          >
            Créer la tâche
          </button>
        </div>
      </Modal>
    </div>
  );
}

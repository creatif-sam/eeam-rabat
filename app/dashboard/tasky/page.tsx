"use client";

import { useEffect, useState } from "react";
import { Calendar, User, FolderKanban } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Modal from "@/components/dashboard/Modal";

type Status = "backlog" | "in_progress" | "review" | "done";

const columns: { key: Status; label: string }[] = [
  { key: "backlog", label: "À faire" },
  { key: "in_progress", label: "En cours" },
  { key: "review", label: "En révision" },
  { key: "done", label: "Terminé" }
];

function priorityClasses(priority: string) {
  if (priority === "high") return "bg-red-100 text-red-700";
  if (priority === "medium") return "bg-amber-100 text-amber-700";
  return "bg-green-100 text-green-700";
}

function initials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map(p => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function TaskyTab() {
  const supabase = createClient();

  const [projects, setProjects] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [activeProject, setActiveProject] = useState<string | null>(null);

  const [openProject, setOpenProject] = useState(false);
  const [openTask, setOpenTask] = useState(false);

  const [projectForm, setProjectForm] = useState({
    name: "",
    description: ""
  });

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    status: "backlog" as Status,
    priority: "medium",
    due_date: "",
    assigned_to: ""
  });

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    const [{ data: p }, { data: pr }, { data: t }] = await Promise.all([
      supabase.from("projects").select("*").order("created_at"),
      supabase.from("profiles").select("id, full_name, avatar_url").order("full_name"),
      supabase.from("tasks").select("*")
    ]);

    setProjects(p || []);
    setProfiles(pr || []);
    setTasks(t || []);
  }

  async function createProject() {
    if (!projectForm.name) return;

    await supabase.from("projects").insert(projectForm);
    setProjectForm({ name: "", description: "" });
    setOpenProject(false);
    loadAll();
  }

  async function createTask() {
    if (!taskForm.title || !activeProject) return;

    await supabase.from("tasks").insert({
      title: taskForm.title,
      description: taskForm.description,
      status: taskForm.status,
      priority: taskForm.priority,
      due_date: taskForm.due_date || null,
      assigned_to: taskForm.assigned_to || null,
      project_id: activeProject
    });

    setTaskForm({
      title: "",
      description: "",
      status: "backlog",
      priority: "medium",
      due_date: "",
      assigned_to: ""
    });

    setOpenTask(false);
    loadAll();
  }

  async function moveTask(id: string, status: Status) {
    await supabase.from("tasks").update({ status }).eq("id", id);
    loadAll();
  }

  function getProfile(id?: string) {
    return profiles.find(p => p.id === id);
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <h1 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
          <FolderKanban />
          Gestion des projets
        </h1>

        <div className="flex gap-2">
          <button
            onClick={() => setOpenProject(true)}
            className="px-4 py-2 rounded-lg bg-gray-900 text-white"
          >
            Nouveau projet
          </button>

          {activeProject && (
            <button
              onClick={() => setOpenTask(true)}
              className="px-4 py-2 rounded-lg bg-cyan-600 text-white"
            >
              Nouvelle tâche
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        {projects.map(p => (
          <button
            key={p.id}
            onClick={() => setActiveProject(p.id)}
            className={`px-4 py-2 rounded-lg border ${
              activeProject === p.id
                ? "bg-cyan-600 text-white"
                : "bg-white hover:bg-gray-50"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {activeProject && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map(col => (
            <div key={col.key} className="rounded-xl border bg-gray-50 p-4">
              <h2 className="font-medium mb-3">{col.label}</h2>

              <div className="space-y-3">
                {tasks
                  .filter(
                    t =>
                      t.project_id === activeProject &&
                      t.status === col.key
                  )
                  .map(task => {
                    const profile = getProfile(task.assigned_to);

                    return (
                      <div
                        key={task.id}
                        className="bg-white rounded-lg border p-4 shadow-sm"
                      >
                        <p className="font-medium">{task.title}</p>

                        {task.description && (
                          <p className="text-sm text-gray-500 mt-1">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${priorityClasses(
                              task.priority
                            )}`}
                          >
                            Priorité {task.priority}
                          </span>

                          {task.due_date && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Calendar size={12} />
                              {task.due_date}
                            </span>
                          )}
                        </div>

                        {profile && (
                          <div className="mt-3 flex items-center gap-2">
                            {profile.avatar_url ? (
                              <img
                                src={profile.avatar_url}
                                alt={profile.full_name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                                {initials(profile.full_name)}
                              </div>
                            )}

                            <span className="text-sm">
                              {profile.full_name}
                            </span>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-1 mt-3">
                          {columns
                            .filter(c => c.key !== col.key)
                            .map(c => (
                              <button
                                key={c.key}
                                onClick={() =>
                                  moveTask(task.id, c.key)
                                }
                                className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200"
                              >
                                {c.label}
                              </button>
                            ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={openProject}
        onClose={() => setOpenProject(false)}
        title="Créer un projet"
      >
        <div className="space-y-4">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Nom du projet"
            value={projectForm.name}
            onChange={e =>
              setProjectForm({ ...projectForm, name: e.target.value })
            }
          />

          <textarea
            className="w-full border rounded px-3 py-2"
            placeholder="Description"
            rows={3}
            value={projectForm.description}
            onChange={e =>
              setProjectForm({
                ...projectForm,
                description: e.target.value
              })
            }
          />

          <button
            onClick={createProject}
            className="w-full bg-gray-900 text-white py-3 rounded-lg"
          >
            Créer le projet
          </button>
        </div>
      </Modal>

      <Modal
        open={openTask}
        onClose={() => setOpenTask(false)}
        title="Créer une tâche"
      >
        <div className="space-y-4">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Titre"
            value={taskForm.title}
            onChange={e =>
              setTaskForm({ ...taskForm, title: e.target.value })
            }
          />

          <textarea
            className="w-full border rounded px-3 py-2"
            placeholder="Description"
            rows={3}
            value={taskForm.description}
            onChange={e =>
              setTaskForm({
                ...taskForm,
                description: e.target.value
              })
            }
          />

          <select
            className="w-full border rounded px-3 py-2"
            value={taskForm.assigned_to}
            onChange={e =>
              setTaskForm({
                ...taskForm,
                assigned_to: e.target.value
              })
            }
          >
            <option value="">Assigner à</option>
            {profiles.map(p => (
              <option key={p.id} value={p.id}>
                {p.full_name}
              </option>
            ))}
          </select>

          <select
            className="w-full border rounded px-3 py-2"
            value={taskForm.priority}
            onChange={e =>
              setTaskForm({
                ...taskForm,
                priority: e.target.value
              })
            }
          >
            <option value="low">Priorité basse</option>
            <option value="medium">Priorité moyenne</option>
            <option value="high">Priorité élevée</option>
          </select>

          <input
            type="date"
            className="w-full border rounded px-3 py-2"
            value={taskForm.due_date}
            onChange={e =>
              setTaskForm({ ...taskForm, due_date: e.target.value })
            }
          />

          <button
            onClick={createTask}
            className="w-full bg-cyan-600 text-white py-3 rounded-lg"
          >
            Créer la tâche
          </button>
        </div>
      </Modal>
    </div>
  );
}

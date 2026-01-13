"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Calendar,
  User,
  FolderKanban
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Modal from "@/components/dashboard/Modal";

type Status = "backlog" | "in_progress" | "review" | "done";

const columns: { key: Status; label: string }[] = [
  { key: "backlog", label: "À faire" },
  { key: "in_progress", label: "En cours" },
  { key: "review", label: "En révision" },
  { key: "done", label: "Terminé" }
];

export default function TaskyTab() {
  const supabase = createClient();

  const [projects, setProjects] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
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
    assignee_id: ""
  });

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    const [{ data: p }, { data: u }, { data: t }] = await Promise.all([
      supabase.from("projects").select("*").order("created_at"),
      supabase.from("users").select("id, full_name").order("full_name"),
      supabase.from("tasks").select("*")
    ]);

    setProjects(p || []);
    setUsers(u || []);
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
      ...taskForm,
      project_id: activeProject,
      due_date: taskForm.due_date || null,
      assignee_id: taskForm.assignee_id || null
    });

    setTaskForm({
      title: "",
      description: "",
      status: "backlog",
      priority: "medium",
      due_date: "",
      assignee_id: ""
    });

    setOpenTask(false);
    loadAll();
  }

  async function moveTask(id: string, status: Status) {
    await supabase.from("tasks").update({ status }).eq("id", id);
    loadAll();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold flex items-center gap-2">
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

      {/* Projects */}
      <div className="flex gap-3 overflow-x-auto">
        {projects.map(p => (
          <button
            key={p.id}
            onClick={() => setActiveProject(p.id)}
            className={`px-4 py-2 rounded-lg border ${
              activeProject === p.id
                ? "bg-cyan-600 text-white"
                : "bg-white"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Kanban */}
      {activeProject && (
        <div className="grid md:grid-cols-4 gap-4">
          {columns.map(col => (
            <div key={col.key} className="rounded-xl border bg-gray-50 p-3">
              <h2 className="font-medium mb-3">{col.label}</h2>

              <div className="space-y-3">
                {tasks
                  .filter(
                    t =>
                      t.project_id === activeProject &&
                      t.status === col.key
                  )
                  .map(task => (
                    <div
                      key={task.id}
                      className="bg-white rounded-lg border p-3 shadow-sm"
                    >
                      <p className="font-medium">{task.title}</p>

                      {task.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {task.description}
                        </p>
                      )}

                      <div className="flex justify-between mt-3 text-xs text-gray-500">
                        <span className="capitalize">
                          {task.priority}
                        </span>

                        {task.due_date && (
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {task.due_date}
                          </span>
                        )}
                      </div>

                      {task.assignee_id && (
                        <div className="mt-2 flex items-center gap-1 text-xs">
                          <User size={12} />
                          {
                            users.find(
                              u => u.id === task.assignee_id
                            )?.full_name
                          }
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
                              className="px-2 py-1 text-xs rounded bg-gray-100"
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

      {/* Project Modal */}
      <Modal open={openProject} onClose={() => setOpenProject(false)} title="Créer un projet">
        <div className="space-y-3">
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
            className="w-full bg-gray-900 text-white py-2 rounded"
          >
            Créer le projet
          </button>
        </div>
      </Modal>

      {/* Task Modal */}
      <Modal open={openTask} onClose={() => setOpenTask(false)} title="Créer une tâche">
        <div className="space-y-3">
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
            value={taskForm.assignee_id}
            onChange={e =>
              setTaskForm({
                ...taskForm,
                assignee_id: e.target.value
              })
            }
          >
            <option value="">Assigner à</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.full_name}
              </option>
            ))}
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
            className="w-full bg-cyan-600 text-white py-2 rounded"
          >
            Créer la tâche
          </button>
        </div>
      </Modal>
    </div>
  );
}

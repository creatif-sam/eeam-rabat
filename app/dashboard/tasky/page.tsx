"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Plus, FolderKanban, MoreVertical, Calendar, User, Tag,
  ChevronDown, Trash2, Pencil, MessageSquare, X, Check,
  ArrowRight, Search, Filter, LayoutGrid, List,
  AlertCircle, Clock, Zap, CheckCircle2, Circle, Timer,
  ChevronRight, Loader2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type Status = "backlog" | "in_progress" | "review" | "done";
type Priority = "low" | "medium" | "high";
type ViewMode = "board" | "list";

const COLUMNS: { key: Status; label: string; color: string; icon: any; bg: string }[] = [
  { key: "backlog",     label: "A faire",         color: "text-gray-500",   icon: Circle,       bg: "bg-gray-100 dark:bg-gray-800" },
  { key: "in_progress", label: "En cours",         color: "text-blue-600",   icon: Timer,        bg: "bg-blue-50 dark:bg-blue-900/20" },
  { key: "review",      label: "Revision",         color: "text-amber-600",  icon: AlertCircle,  bg: "bg-amber-50 dark:bg-amber-900/20" },
  { key: "done",        label: "Termine",          color: "text-green-600",  icon: CheckCircle2, bg: "bg-green-50 dark:bg-green-900/20" },
];

const PRIORITY_CFG: Record<Priority, { label: string; color: string; dot: string }> = {
  low:    { label: "Basse",   color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",  dot: "bg-emerald-500" },
  medium: { label: "Moyenne", color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",        dot: "bg-amber-500" },
  high:   { label: "Elevee",  color: "text-rose-600 bg-rose-50 dark:bg-rose-900/20",           dot: "bg-rose-500" },
};

function initials(name?: string | null) {
  if (!name) return "?";
  return name.split(" ").map((p: string) => p[0]).slice(0, 2).join("").toUpperCase();
}

function renderMentions(text: string) {
  return text.split(/(@[A-Za-z\u00C0-\u024F ]+)/g).map((part: string, i: number) =>
    part.startsWith("@")
      ? <span key={i} className="bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 px-1 rounded font-medium">{part}</span>
      : <span key={i}>{part}</span>
  );
}

function Avatar({ url, name, size = 7 }: { url?: string | null; name?: string | null; size?: number }) {
  const cls = `w-${size} h-${size} rounded-full flex items-center justify-center text-xs font-semibold shrink-0`;
  if (url) return <img src={url} className={`${cls} object-cover`} alt={name ?? ""} />;
  return <div className={`${cls} bg-gradient-to-br from-cyan-500 to-blue-600 text-white`}>{initials(name)}</div>;
}

function PriorityBadge({ p }: { p: Priority }) {
  const cfg = PRIORITY_CFG[p];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function StatusBadge({ s }: { s: Status }) {
  const col = COLUMNS.find(c => c.key === s)!;
  const Icon = col.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${col.color} ${col.bg}`}>
      <Icon size={11} />
      {col.label}
    </span>
  );
}

export default function TaskyPage() {
  const supabase = createClient();
  const [projects, setProjects] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("board");
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [commentText, setCommentText] = useState("");
  const [mentionQuery, setMentionQuery] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [projectForm, setProjectForm] = useState({ name: "", description: "", color: "#06b6d4" });
  const [taskForm, setTaskForm] = useState({
    title: "", description: "", status: "backlog" as Status,
    priority: "medium" as Priority, due_date: "", assigned_to: ""
  });

  const loadAll = useCallback(async () => {
    const [{ data: p }, { data: pr }, { data: t }] = await Promise.all([
      supabase.from("projects").select("*").order("created_at"),
      supabase.from("profiles").select("id, full_name, avatar_url, email").order("full_name"),
      supabase.from("tasks").select("*").order("created_at", { ascending: false }),
    ]);
    setProjects(p || []);
    setProfiles(pr || []);
    setTasks(t || []);
    if (p && p.length && !activeProject) setActiveProject(p[0].id);
  }, [supabase]);

  useEffect(() => { loadAll(); }, []);

  async function loadComments(taskId: string) {
    const { data } = await supabase
      .from("task_comments")
      .select("*, profiles(full_name, avatar_url)")
      .eq("task_id", taskId)
      .order("created_at");
    setComments(data || []);
  }

  async function createProject() {
    if (!projectForm.name.trim()) { toast.error("Le nom du projet est requis"); return; }
    setLoadingAction(true);
    const { error } = await supabase.from("projects").insert(projectForm);
    setLoadingAction(false);
    if (error) { toast.error("Impossible de creer le projet"); return; }
    toast.success("Projet cree !");
    setProjectForm({ name: "", description: "", color: "#06b6d4" });
    setShowProjectModal(false);
    loadAll();
  }

  async function deleteProject(id: string) {
    toast("Supprimer ce projet et toutes ses tâches ?", {
      action: {
        label: "Supprimer",
        onClick: async () => {
          await supabase.from("tasks").delete().eq("project_id", id);
          const { error } = await supabase.from("projects").delete().eq("id", id);
          if (error) {
            toast.error("Impossible de supprimer le projet.");
            return;
          }
          toast.success("Projet supprime");
          if (activeProject === id) setActiveProject(null);
          loadAll();
        }
      },
      cancel: { label: "Annuler", onClick: () => {} }
    });
  }

  async function sendTaskAssignmentEmail(assignedToId: string, taskTitle: string, projectName: string, priority: string, dueDate?: string) {
    const profile = profiles.find(p => p.id === assignedToId);
    if (!profile?.email) return;
    const priorityLabels: Record<string, string> = { low: "Basse", medium: "Moyenne", high: "Elevée" };
    const html = `
      <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px 24px;background:#f9fafb;border-radius:12px">
        <h2 style="color:#0e7490;margin-bottom:8px">📋 Nouvelle tâche assignée</h2>
        <p style="color:#374151">Bonjour <strong>${profile.full_name}</strong>,</p>
        <p style="color:#374151">Une tâche vous a été assignée dans le projet <strong>${projectName}</strong>.</p>
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin:20px 0">
          <p style="margin:4px 0;color:#374151"><strong>Tâche :</strong> ${taskTitle}</p>
          <p style="margin:4px 0;color:#374151"><strong>Priorité :</strong> ${priorityLabels[priority] ?? priority}</p>
          ${dueDate ? `<p style="margin:4px 0;color:#374151"><strong>Échéance :</strong> ${new Date(dueDate).toLocaleDateString("fr-FR")}</p>` : ""}
        </div>
        <p style="color:#6b7280;font-size:13px;margin-top:24px">Église EEAM — Planify</p>
      </div>`;
    fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: profile.email,
        subject: `Tâche assignée : ${taskTitle} — EEAM Planify`,
        html,
      }),
    });
  }

  async function createTask() {
    if (!taskForm.title.trim()) { toast.error("Le titre est requis"); return; }
    if (!activeProject) { toast.error("Selectionnez un projet"); return; }
    setLoadingAction(true);
    const { error } = await supabase.from("tasks").insert({
      ...taskForm,
      due_date: taskForm.due_date || null,
      assigned_to: taskForm.assigned_to || null,
      project_id: activeProject,
    });
    setLoadingAction(false);
    if (error) { toast.error("Impossible de creer la tache"); return; }
    toast.success("Tache ajoutee !");
    if (taskForm.assigned_to) {
      const proj = projects.find(p => p.id === activeProject);
      sendTaskAssignmentEmail(taskForm.assigned_to, taskForm.title, proj?.name ?? "Projet", taskForm.priority, taskForm.due_date || undefined);
    }
    setTaskForm({ title: "", description: "", status: "backlog", priority: "medium", due_date: "", assigned_to: "" });
    setShowTaskModal(false);
    loadAll();
  }

  async function moveTask(id: string, status: Status) {
    const { error } = await supabase.from("tasks").update({ status }).eq("id", id);
    if (error) {
      toast.error("Impossible de déplacer la tâche.");
      return;
    }
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    const col = COLUMNS.find(c => c.key === status)!;
    toast.success(`Deplace vers "${col.label}"`);
  }

  async function deleteTask(id: string) {
    toast("Supprimer cette tâche ?", {
      action: {
        label: "Supprimer",
        onClick: async () => {
          const { error } = await supabase.from("tasks").delete().eq("id", id);
          if (error) {
            toast.error("Impossible de supprimer la tâche.");
            return;
          }
          setTasks(prev => prev.filter(t => t.id !== id));
          setSelectedTask(null);
          toast.success("Tache supprimee");
        }
      },
      cancel: { label: "Annuler", onClick: () => {} }
    });
  }

  async function saveEditTask() {
    if (!editingTask) return;
    setLoadingAction(true);
    const { error } = await supabase.from("tasks").update({
      title: editingTask.title,
      description: editingTask.description,
      status: editingTask.status,
      priority: editingTask.priority,
      due_date: editingTask.due_date || null,
      assigned_to: editingTask.assigned_to || null,
    }).eq("id", editingTask.id);
    setLoadingAction(false);
    if (error) { toast.error("Erreur lors de la sauvegarde"); return; }
    toast.success("Tache mise a jour");
    if (editingTask.assigned_to) {
      const proj = projects.find(p => p.id === editingTask.project_id);
      sendTaskAssignmentEmail(editingTask.assigned_to, editingTask.title, proj?.name ?? "Projet", editingTask.priority, editingTask.due_date || undefined);
    }
    setTasks(prev => prev.map(t => t.id === editingTask.id ? editingTask : t));
    setSelectedTask(editingTask);
    setEditingTask(null);
  }

  async function addComment() {
    if (!commentText.trim() || !selectedTask) return;
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("task_comments").insert({
      task_id: selectedTask.id, author_id: user?.id, content: commentText,
    });
    if (error) { toast.error("Erreur lors du commentaire"); return; }
    setCommentText(""); setMentionQuery("");
    loadComments(selectedTask.id);
    toast.success("Commentaire publie");
  }

  function onCommentChange(value: string) {
    setCommentText(value);
    const match = value.match(/@(\w*)$/);
    setMentionQuery(match ? match[1] : "");
  }

  const projectTasks = tasks.filter(t =>
    t.project_id === activeProject &&
    (filterPriority === "all" || t.priority === filterPriority) &&
    (!search || t.title?.toLowerCase().includes(search.toLowerCase()))
  );
  const getProfile = (id?: string) => profiles.find(p => p.id === id);
  const isOverdue = (due?: string) => due && new Date(due) < new Date();

  return (
    <div className="flex flex-col md:flex-row h-auto md:h-[calc(100vh-5rem)] bg-gray-50 dark:bg-gray-950 overflow-hidden">

      {/* Left sidebar */}
      <aside className="w-full md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col max-h-[42vh] md:max-h-none">
        <div className="px-4 py-3 md:py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Projets</span>
          <button onClick={() => setShowProjectModal(true)} aria-label="Nouveau projet" className="w-6 h-6 rounded-md bg-cyan-600 hover:bg-cyan-700 text-white flex items-center justify-center transition-colors">
            <Plus size={13} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-2 space-y-0.5 px-2">
          {projects.length === 0 && <p className="text-xs text-gray-400 px-2 py-4 text-center">Aucun projet</p>}
          {projects.map(p => (
            <div key={p.id} className="group relative">
              <button
                onClick={() => setActiveProject(p.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeProject === p.id
                    ? "bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color || "#06b6d4" }} />
                <span className="truncate flex-1 text-left">{p.name}</span>
                <span className="text-xs text-gray-400 font-normal">{tasks.filter(t => t.project_id === p.id).length}</span>
              </button>
              <button onClick={() => deleteProject(p.id)} aria-label="Supprimer le projet" className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-rose-500 transition-all">
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Toolbar */}
        <div className="shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-3 md:px-5 py-3 flex flex-wrap items-center gap-2 md:gap-3">
          <h1 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-2 mr-0 md:mr-4 w-full md:w-auto">
            <FolderKanban size={16} className="text-cyan-600" />
            {projects.find(p => p.id === activeProject)?.name ?? "Selectionnez un projet"}
          </h1>
          <div className="relative flex-1 min-w-[180px] md:max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
              className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-cyan-400 focus:bg-white dark:focus:bg-gray-900 rounded-lg outline-none transition-all text-gray-700 dark:text-gray-300" />
          </div>
          <div className="relative w-full sm:w-auto">
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value as any)}
              className="w-full text-xs pl-3 pr-7 py-1.5 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-lg outline-none text-gray-600 dark:text-gray-300 appearance-none cursor-pointer">
              <option value="all">Toutes priorites</option>
              <option value="high">Elevee</option>
              <option value="medium">Moyenne</option>
              <option value="low">Basse</option>
            </select>
            <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 md:ml-auto">
            <button onClick={() => setViewMode("board")} aria-label="Affichage tableau" className={`p-1.5 rounded-md transition-all ${viewMode === "board" ? "bg-white dark:bg-gray-700 shadow text-cyan-600" : "text-gray-500"}`}><LayoutGrid size={14} /></button>
            <button onClick={() => setViewMode("list")} aria-label="Affichage liste" className={`p-1.5 rounded-md transition-all ${viewMode === "list" ? "bg-white dark:bg-gray-700 shadow text-cyan-600" : "text-gray-500"}`}><List size={14} /></button>
          </div>
          {activeProject && (
            <button onClick={() => setShowTaskModal(true)}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
              <Plus size={14} /> Tache
            </button>
          )}
        </div>

        {/* Content */}
        {!activeProject ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-3">
            <FolderKanban size={48} className="opacity-30" />
            <p className="text-sm">Selectionnez ou creez un projet</p>
            <button onClick={() => setShowProjectModal(true)} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm hover:bg-cyan-700 transition-colors">Nouveau projet</button>
          </div>
        ) : viewMode === "board" ? (
          <div className="flex-1 overflow-y-auto md:overflow-x-auto p-3 md:p-5">
            <div className="flex flex-col md:flex-row gap-4 h-auto md:h-full md:min-w-[900px]">
              {COLUMNS.map(col => {
                const colTasks = projectTasks.filter(t => t.status === col.key);
                const Icon = col.icon;
                return (
                  <div key={col.key} className="flex flex-col w-full md:w-64 shrink-0">
                    <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl mb-3 ${col.bg}`}>
                      <div className="flex items-center gap-2">
                        <Icon size={14} className={col.color} />
                        <span className={`text-xs font-semibold ${col.color}`}>{col.label}</span>
                        <span className="ml-1 text-xs bg-white/70 dark:bg-gray-900/50 px-1.5 py-0.5 rounded-full font-bold text-gray-600 dark:text-gray-400">{colTasks.length}</span>
                      </div>
                      <button onClick={() => { setTaskForm(prev => ({ ...prev, status: col.key })); setShowTaskModal(true); }}
                        aria-label="Ajouter une tâche"
                        className={`w-5 h-5 rounded flex items-center justify-center hover:bg-white/50 transition-colors ${col.color}`}>
                        <Plus size={12} />
                      </button>
                    </div>
                    <div className="flex-1 space-y-2.5 overflow-y-visible md:overflow-y-auto pr-0 md:pr-1">
                      {colTasks.map(task => {
                        const profile = getProfile(task.assigned_to);
                        const overdue = isOverdue(task.due_date) && task.status !== "done";
                        return (
                          <div key={task.id} onClick={() => { setSelectedTask(task); loadComments(task.id); }}
                            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-3.5 shadow-sm hover:shadow-md hover:border-cyan-200 dark:hover:border-cyan-800 transition-all cursor-pointer group">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-snug line-clamp-2">{task.title}</p>
                              <button onClick={e => { e.stopPropagation(); deleteTask(task.id); }}
                                aria-label="Supprimer la tâche"
                                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-50 text-gray-400 hover:text-rose-500 transition-all shrink-0">
                                <Trash2 size={12} />
                              </button>
                            </div>
                            {task.description && <p className="text-xs text-gray-400 mb-2 line-clamp-2">{task.description}</p>}
                            <div className="flex items-center justify-between mt-2">
                              <PriorityBadge p={task.priority} />
                              {task.due_date && (
                                <span className={`flex items-center gap-1 text-xs ${overdue ? "text-rose-500 font-medium" : "text-gray-400"}`}>
                                  <Clock size={11} />
                                  {new Date(task.due_date).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })}
                                </span>
                              )}
                            </div>
                            {profile && (
                              <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-gray-50 dark:border-gray-800">
                                <Avatar url={profile.avatar_url} name={profile.full_name} size={5} />
                                <span className="text-xs text-gray-500 truncate">{profile.full_name}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {colTasks.length === 0 && (
                        <button onClick={() => { setTaskForm(prev => ({ ...prev, status: col.key })); setShowTaskModal(true); }}
                          className="w-full py-6 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl text-xs text-gray-400 hover:border-cyan-300 hover:text-cyan-500 transition-colors">
                          + Ajouter une tache
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-3 md:p-5">
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tache</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Priorite</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigne</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Echeance</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {projectTasks.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                      Aucune tache <button onClick={() => setShowTaskModal(true)} className="text-cyan-600 underline">creer une tache</button>
                    </td></tr>
                  )}
                  {projectTasks.map(task => {
                    const profile = getProfile(task.assigned_to);
                    const overdue = isOverdue(task.due_date) && task.status !== "done";
                    return (
                      <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 cursor-pointer transition-colors"
                        onClick={() => { setSelectedTask(task); loadComments(task.id); }}>
                        <td className="px-4 py-3">
                          <p className="font-medium text-gray-800 dark:text-gray-200">{task.title}</p>
                          {task.description && <p className="text-xs text-gray-400 truncate max-w-xs">{task.description}</p>}
                        </td>
                        <td className="px-4 py-3"><StatusBadge s={task.status} /></td>
                        <td className="px-4 py-3"><PriorityBadge p={task.priority} /></td>
                        <td className="px-4 py-3">
                          {profile ? (
                            <div className="flex items-center gap-2">
                              <Avatar url={profile.avatar_url} name={profile.full_name} size={6} />
                              <span className="text-xs text-gray-600 dark:text-gray-400">{profile.full_name}</span>
                            </div>
                          ) : <span className="text-xs text-gray-300">-</span>}
                        </td>
                        <td className="px-4 py-3">
                          {task.due_date ? <span className={`text-xs ${overdue ? "text-rose-500 font-medium" : "text-gray-500"}`}>{new Date(task.due_date).toLocaleDateString("fr-FR")}</span>
                            : <span className="text-gray-300 text-xs">-</span>}
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={e => { e.stopPropagation(); deleteTask(task.id); }} aria-label="Supprimer la tâche" className="p-1 rounded hover:bg-rose-50 text-gray-300 hover:text-rose-500 transition-all">
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Task detail drawer */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex">
          <div className="flex-1 bg-black/40" onClick={() => { setSelectedTask(null); setEditingTask(null); }} />
          <aside className="w-full sm:w-[480px] bg-white dark:bg-gray-900 shadow-2xl flex flex-col border-l border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <StatusBadge s={selectedTask.status} />
                <PriorityBadge p={selectedTask.priority} />
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setEditingTask({ ...selectedTask })} aria-label="Modifier la tâche" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"><Pencil size={14} /></button>
                <button onClick={() => deleteTask(selectedTask.id)} aria-label="Supprimer la tâche" className="p-1.5 rounded-lg hover:bg-rose-50 text-gray-500 hover:text-rose-500 transition-colors"><Trash2 size={14} /></button>
                <button onClick={() => { setSelectedTask(null); setEditingTask(null); }} aria-label="Fermer" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"><X size={16} /></button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5">
              {editingTask ? (
                <input value={editingTask.title} onChange={e => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full text-xl font-bold bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 outline-none border border-cyan-400 text-gray-900 dark:text-white" />
              ) : (
                <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-snug">{selectedTask.title}</h2>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                  <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-1.5">Statut</p>
                  {editingTask ? (
                    <select value={editingTask.status} onChange={e => setEditingTask({ ...editingTask, status: e.target.value })}
                      className="w-full text-xs p-1.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 outline-none">
                      {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                    </select>
                  ) : <StatusBadge s={selectedTask.status} />}
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                  <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-1.5">Priorite</p>
                  {editingTask ? (
                    <select value={editingTask.priority} onChange={e => setEditingTask({ ...editingTask, priority: e.target.value })}
                      className="w-full text-xs p-1.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 outline-none">
                      {(["low","medium","high"] as Priority[]).map(p => <option key={p} value={p}>{PRIORITY_CFG[p].label}</option>)}
                    </select>
                  ) : <PriorityBadge p={selectedTask.priority} />}
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                  <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-1.5">Assigne</p>
                  {editingTask ? (
                    <select value={editingTask.assigned_to || ""} onChange={e => setEditingTask({ ...editingTask, assigned_to: e.target.value })}
                      className="w-full text-xs p-1.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 outline-none">
                      <option value="">Non assigne</option>
                      {profiles.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                    </select>
                  ) : (() => {
                    const pr = getProfile(selectedTask.assigned_to);
                    return pr ? (
                      <div className="flex items-center gap-1.5">
                        <Avatar url={pr.avatar_url} name={pr.full_name} size={5} />
                        <span className="text-xs text-gray-700 dark:text-gray-300">{pr.full_name}</span>
                      </div>
                    ) : <span className="text-xs text-gray-400">Non assigne</span>;
                  })()}
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                  <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-1.5">Echeance</p>
                  {editingTask ? (
                    <input type="date" value={editingTask.due_date || ""} onChange={e => setEditingTask({ ...editingTask, due_date: e.target.value })}
                      className="w-full text-xs p-1.5 rounded-lg bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 outline-none" />
                  ) : selectedTask.due_date ? (
                    <span className={`text-xs flex items-center gap-1 ${isOverdue(selectedTask.due_date) && selectedTask.status !== "done" ? "text-rose-500 font-medium" : "text-gray-600 dark:text-gray-400"}`}>
                      <Clock size={11} />{new Date(selectedTask.due_date).toLocaleDateString("fr-FR")}
                    </span>
                  ) : <span className="text-xs text-gray-400">-</span>}
                </div>
              </div>

              {!editingTask && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Deplacer vers</p>
                  <div className="flex flex-wrap gap-1.5">
                    {COLUMNS.filter(c => c.key !== selectedTask.status).map(c => (
                      <button key={c.key} onClick={() => { moveTask(selectedTask.id, c.key); setSelectedTask({ ...selectedTask, status: c.key }); }}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${c.bg} ${c.color} hover:opacity-80 transition-opacity`}>
                        <ArrowRight size={11} /> {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</p>
                {editingTask ? (
                  <textarea value={editingTask.description || ""} onChange={e => setEditingTask({ ...editingTask, description: e.target.value })}
                    rows={3} className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-cyan-400 resize-none text-gray-700 dark:text-gray-300" />
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 leading-relaxed min-h-[60px]">
                    {selectedTask.description || <span className="italic text-gray-300">Aucune description</span>}
                  </p>
                )}
              </div>

              {editingTask && (
                <div className="flex gap-2">
                  <button onClick={saveEditTask} disabled={loadingAction}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-60">
                    {loadingAction ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Sauvegarder
                  </button>
                  <button onClick={() => setEditingTask(null)}
                    className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                    Annuler
                  </button>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <MessageSquare size={12} /> Commentaires ({comments.length})
                </p>
                <div className="space-y-3 mb-4">
                  {comments.map(c => (
                    <div key={c.id} className="flex gap-3">
                      <Avatar url={c.profiles?.avatar_url} name={c.profiles?.full_name} size={7} />
                      <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">{c.profiles?.full_name}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{renderMentions(c.content)}</p>
                        <p className="text-[10px] text-gray-400 mt-1.5">{new Date(c.created_at).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="relative">
                  <textarea ref={textareaRef} value={commentText} onChange={e => onCommentChange(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); addComment(); } }}
                    className="w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-cyan-400 resize-none text-gray-700 dark:text-gray-300"
                    placeholder="Commentaire... @mention (Ctrl+Enter)" rows={3} />
                  {mentionQuery !== "" && (
                    <div className="absolute bottom-full mb-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl w-full z-10 overflow-hidden">
                      {profiles.filter(p => p.full_name?.toLowerCase().includes(mentionQuery.toLowerCase())).slice(0, 5).map(p => (
                        <button key={p.id} onClick={() => { setCommentText(prev => prev.replace(/@\w*$/, `@${p.full_name} `)); setMentionQuery(""); textareaRef.current?.focus(); }}
                          className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm transition-colors">
                          <Avatar url={p.avatar_url} name={p.full_name} size={6} />{p.full_name}
                        </button>
                      ))}
                    </div>
                  )}
                  <button onClick={addComment} className="absolute bottom-3 right-3 px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-medium rounded-lg transition-colors">Publier</button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Project modal */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><FolderKanban size={16} className="text-cyan-600" /> Nouveau projet</h2>
              <button onClick={() => setShowProjectModal(false)} aria-label="Fermer" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Nom du projet *</label>
                <input value={projectForm.name} onChange={e => setProjectForm({ ...projectForm, name: e.target.value })}
                  onKeyDown={e => e.key === "Enter" && createProject()} placeholder="Ex: Evenement de Noel"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-cyan-400 text-gray-800 dark:text-gray-200" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Description</label>
                <textarea value={projectForm.description} onChange={e => setProjectForm({ ...projectForm, description: e.target.value })}
                  rows={3} placeholder="Description du projet..."
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-cyan-400 text-gray-800 dark:text-gray-200 resize-none" />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold text-gray-500">Couleur</label>
                <input type="color" value={projectForm.color} onChange={e => setProjectForm({ ...projectForm, color: e.target.value })}
                  className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer" />
              </div>
              <button onClick={createProject} disabled={loadingAction}
                className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60">
                {loadingAction ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Creer le projet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task create modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Zap size={16} className="text-cyan-600" /> Nouvelle tache</h2>
              <button onClick={() => setShowTaskModal(false)} aria-label="Fermer" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"><X size={16} /></button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <input value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="Titre de la tache *"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-cyan-400 text-gray-800 dark:text-gray-200 font-medium" />
              <textarea value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
                rows={3} placeholder="Description (optionnel)"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none focus:border-cyan-400 text-gray-800 dark:text-gray-200 resize-none" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Statut</label>
                  <select value={taskForm.status} onChange={e => setTaskForm({ ...taskForm, status: e.target.value as Status })}
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none text-gray-700 dark:text-gray-300">
                    {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Priorite</label>
                  <select value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value as Priority })}
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none text-gray-700 dark:text-gray-300">
                    <option value="low">Basse</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Elevee</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Assigne a</label>
                  <select value={taskForm.assigned_to} onChange={e => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none text-gray-700 dark:text-gray-300">
                    <option value="">Non assigne</option>
                    {profiles.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Echeance</label>
                  <input type="date" value={taskForm.due_date} onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm outline-none text-gray-700 dark:text-gray-300" />
                </div>
              </div>
              <button onClick={createTask} disabled={loadingAction}
                className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-60">
                {loadingAction ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />} Creer la tache
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

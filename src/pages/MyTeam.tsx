import { useState, useEffect } from "react";
import { Calendar, ExternalLink, Plus, Users, Loader2, FolderOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { api, getToken } from "@/lib/api";
import { useApp } from "@/lib/store";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const columns = ["Todo", "In Progress", "Review", "Done"];
const statusColor: Record<string, string> = {
  Todo: "bg-secondary text-muted-foreground",
  "In Progress": "bg-primary-soft text-primary",
  Review: "bg-[hsl(var(--warning)/0.12)] text-warning",
  Done: "bg-success-bg text-success",
};

export default function MyTeam() {
  const { state } = useApp();
  const [teams, setTeams] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTeam, setActiveTeam] = useState<any>(null);

  // Create team dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamDesc, setTeamDesc] = useState("");

  // Create task dialog
  const [taskOpen, setTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskStatus, setTaskStatus] = useState("Todo");
  const [draggedOverCol, setDraggedOverCol] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) { setLoading(false); return; }
    api.getMyTeams()
      .then(data => {
        if (Array.isArray(data)) {
          setTeams(data);
          if (data.length > 0) {
            setActiveTeam(data[0]);
            return api.getTeamTasks(data[0].id);
          }
        }
        return [];
      })
      .then(taskData => {
        if (Array.isArray(taskData)) setTasks(taskData);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreateTeam = async () => {
    if (!teamName.trim()) return;
    try {
      const newTeam = await api.createTeam({ name: teamName.trim(), description: teamDesc.trim() || undefined });
      setTeams(prev => [...prev, newTeam]);
      setActiveTeam(newTeam);
      setTasks([]);
      setCreateOpen(false);
      setTeamName("");
      setTeamDesc("");
    } catch (err: any) {
      alert(err.message || "Failed to create team");
    }
  };

  const handleCreateTask = async () => {
    if (!taskTitle.trim() || !activeTeam) return;
    try {
      const newTask = await api.createTask(activeTeam.id, { title: taskTitle.trim(), status: taskStatus });
      setTasks(prev => [...prev, newTask]);
      setTaskOpen(false);
      setTaskTitle("");
      setTaskStatus("Todo");
    } catch (err: any) {
      alert(err.message || "Failed to create task");
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", String(id));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = async (e: React.DragEvent, col: string) => {
    e.preventDefault();
    setDraggedOverCol(null);
    const id = e.dataTransfer.getData("text/plain");
    if (id && activeTeam) {
      setTasks(prev => prev.map(t => (String(t.id) === id ? { ...t, status: col } : t)));
      try {
        await api.updateTask(activeTeam.id, Number(id), { status: col });
      } catch {}
    }
  };

  if (loading) {
    return (
      <div className="container py-20 flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  // No teams yet
  if (teams.length === 0) {
    return (
      <div className="container py-10">
        <div className="ds-card p-12 text-center bg-gradient-hero">
          <FolderOpen className="size-14 text-muted-foreground/40 mx-auto mb-4" />
          <h1 className="ds-page-title">No teams yet</h1>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">Create your first team to start collaborating with other builders on projects.</p>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <button className="mt-6 h-11 px-6 rounded-xl bg-primary text-white font-semibold inline-flex items-center gap-2 hover:bg-primary-hover">
                <Plus className="size-4" /> Create Team
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create a New Team</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                <div><Label>Team Name</Label><Input value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="e.g. DevSync Core Team" /></div>
                <div><Label>Description (optional)</Label><Input value={teamDesc} onChange={e => setTeamDesc(e.target.value)} placeholder="What does this team work on?" /></div>
              </div>
              <DialogFooter><Button onClick={handleCreateTeam} disabled={!teamName.trim()}>Create Team</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10 space-y-6">
      <div className="ds-card p-7 bg-gradient-hero flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="ds-chip-primary">Your Team</span>
          <h1 className="ds-page-title mt-2">{activeTeam?.name || "My Team"}</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">{activeTeam?.description || "Manage your team, tasks, and progress."}</p>
        </div>
        <div className="flex gap-2">
          {activeTeam && (
            <Link to={`/team/${activeTeam.id}`} className="h-11 px-5 rounded-xl bg-card border border-border font-semibold text-sm hover:bg-secondary inline-flex items-center gap-2">View Team Page <ExternalLink className="size-4" /></Link>
          )}
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <button className="h-11 px-5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover inline-flex items-center gap-2"><Plus className="size-4" /> New Team</button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create a New Team</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                <div><Label>Team Name</Label><Input value={teamName} onChange={e => setTeamName(e.target.value)} placeholder="e.g. DevSync Core Team" /></div>
                <div><Label>Description (optional)</Label><Input value={teamDesc} onChange={e => setTeamDesc(e.target.value)} placeholder="What does this team work on?" /></div>
              </div>
              <DialogFooter><Button onClick={handleCreateTeam} disabled={!teamName.trim()}>Create Team</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Sprint Progress */}
      {activeTeam && (
        <div className="ds-card p-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-lg">Sprint Progress</h3>
            <span className="text-sm text-muted-foreground">{activeTeam.sprint_progress || 0}%</span>
          </div>
          <div className="flex gap-0.5 mt-2">
            {Array.from({ length: 20 }).map((_, i) => {
              const progress = activeTeam.sprint_progress || 0;
              const activeSegments = Math.max(0, Math.round((progress / 100) * 20));
              return <div key={i} className={`flex-1 h-1.5 rounded-full ${i < activeSegments ? "bg-gradient-primary" : "bg-secondary"}`} />;
            })}
          </div>
        </div>
      )}

      {/* Task Board */}
      <div className="ds-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-lg">Task Board</h3>
          <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
            <DialogTrigger asChild>
              <button className="h-9 px-4 rounded-xl bg-primary text-white text-sm font-semibold inline-flex items-center gap-1.5 hover:bg-primary-hover">
                <Plus className="size-4" /> New task
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add a Task</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                <div><Label>Task Title</Label><Input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="e.g. Design homepage wireframe" /></div>
                <div>
                  <Label>Status</Label>
                  <select value={taskStatus} onChange={e => setTaskStatus(e.target.value)} className="ds-input w-full mt-1">
                    {columns.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <DialogFooter><Button onClick={handleCreateTask} disabled={!taskTitle.trim()}>Add Task</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((col) => (
            <div
              key={col}
              onDragOver={(e) => { e.preventDefault(); setDraggedOverCol(col); }}
              onDragLeave={() => setDraggedOverCol(null)}
              onDrop={(e) => handleDrop(e, col)}
              className={`min-h-[150px] rounded-xl border-2 border-dashed p-3 transition-colors ${
                draggedOverCol === col ? "border-primary bg-primary/5" : "border-border"
              }`}
            >
              <div className="mb-3">
                <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${statusColor[col]}`}>{col}</span>
              </div>
              <div className="space-y-2">
                {tasks.filter(t => t.status === col).map(t => (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, String(t.id))}
                    className="p-3 rounded-xl bg-card border border-border cursor-grab active:cursor-grabbing hover:border-primary/30 transition-colors"
                  >
                    <p className="font-medium text-sm">{t.title}</p>
                    {t.assignee_username && <p className="text-xs text-muted-foreground mt-1">@{t.assignee_username}</p>}
                  </div>
                ))}
                {tasks.filter(t => t.status === col).length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">Drag tasks here</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useState, useMemo } from "react";
import { team } from "@/data/mock";
import { Calendar, ExternalLink, MessageSquare, Plus, Users, Activity as ActivityIcon } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
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
  const [tasks, setTasks] = useState(() =>
    team.tasks.map((t) => {
      if (t.id === "t1") return { ...t, tech: ["FastAPI", "ML"] };
      if (t.id === "t2") return { ...t, tech: ["React", "UI/UX"] };
      if (t.id === "t3") return { ...t, tech: ["Docker", "GitHub"] };
      if (t.id === "t4") return { ...t, tech: ["React"] };
      return { ...t, tech: [] as string[] };
    })
  );

  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [assignee, setAssignee] = useState("");
  const [taskTech, setTaskTech] = useState("");
  const [status, setStatus] = useState("Todo");

  const [draggedOverCol, setDraggedOverCol] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, col: string) => {
    e.preventDefault();
    if (draggedOverCol !== col) {
      setDraggedOverCol(col);
    }
  };

  const handleDragLeave = () => {
    setDraggedOverCol(null);
  };

  const handleDrop = (e: React.DragEvent, col: string) => {
    e.preventDefault();
    setDraggedOverCol(null);
    const id = e.dataTransfer.getData("text/plain");
    if (id) {
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status: col as any } : t)));
    }
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const newTask = {
      id: `t_${Date.now()}`,
      title: title.trim(),
      assignee: assignee.trim() || "Unassigned",
      tech: taskTech ? taskTech.split(",").map((s) => s.trim()).filter(Boolean) : [],
      status: status as any,
    };
    setTasks([...tasks, newTask]);
    setTitle("");
    setAssignee("");
    setTaskTech("");
    setStatus("Todo");
    setIsOpen(false);
  };
  return (
    <div className="container py-10 space-y-6">
      <div className="ds-card p-7 bg-gradient-hero flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="ds-chip-primary">Your Team</span>
          <h1 className="ds-page-title mt-2">{team.name}</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">{team.mission}</p>
        </div>
        <div className="flex gap-2">
          <Link to={`/team/${team.id}`} className="h-11 px-5 rounded-xl bg-card border border-border font-semibold text-sm hover:bg-secondary inline-flex items-center gap-2">View Team Page <ExternalLink className="size-4" /></Link>
          <button className="h-11 px-5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover inline-flex items-center gap-2"><Plus className="size-4" /> Invite</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="ds-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-1"><h3 className="font-semibold text-lg">Active Project</h3><span className="ds-chip-primary">In Progress</span></div>
          <p className="text-2xl font-display font-bold mt-1">{team.activeProject}</p>
          <p className="text-sm text-muted-foreground mt-1">{team.sprint.name} · {team.sprint.daysLeft} days left</p>
          <div className="mt-5">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5"><span>Sprint progress</span><span>{team.sprint.progress}%</span></div>
            <div className="flex gap-0.5">
              {Array.from({ length: 20 }).map((_, i) => {
                const activeSegments = Math.max(1, Math.round((team.sprint.progress / 100) * 20));
                return <div key={i} className={`flex-1 h-1.5 rounded-full ${i < activeSegments ? "bg-gradient-primary" : "bg-secondary"}`} />;
              })}
            </div>
          </div>
        </div>

        <div className="ds-card p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Calendar className="size-4 text-primary" /> Meetings</h3>
          <div className="space-y-3">
            {team.meetings.map((m) => (
              <div key={m.title} className="flex items-center justify-between p-3 rounded-xl bg-secondary">
                <div><p className="font-medium text-sm">{m.title}</p><p className="text-xs text-muted-foreground">{m.time}</p></div>
                <button className="text-xs font-semibold text-primary">Join</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="ds-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-lg flex items-center gap-2"><Users className="size-4 text-primary" /> Members</h3>
            <span className="text-sm text-muted-foreground">{team.members.length} active</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {team.members.map((m) => (
              <div key={m.name} className="p-4 rounded-xl bg-surface-alt border border-border flex gap-3 items-center">
                <div className="size-11 rounded-xl bg-gradient-primary text-white font-semibold flex items-center justify-center shrink-0">{m.avatar}</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{m.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{m.role}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5">{m.skills.map((s) => <span key={s} className="ds-chip text-[10px] py-0.5">{s}</span>)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ds-card p-6">
          <h3 className="font-semibold text-lg mb-4">Resources</h3>
          <div className="space-y-2">
            {team.resources.map((r) => (
              <a key={r.title} href={r.url} className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary transition-colors">
                <span className="text-sm font-medium">{r.title}</span><ExternalLink className="size-4 text-muted-foreground" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="ds-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-lg">Task Board</h3>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <button className="h-10 px-4 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover inline-flex items-center gap-1.5 shadow-glow">
                <Plus className="size-4" /> New task
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddTask} className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="task-title">Task Title</Label>
                  <Input
                    id="task-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Integrate matching engine API"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="task-assignee">Assignee</Label>
                  <Input
                    id="task-assignee"
                    value={assignee}
                    onChange={(e) => setAssignee(e.target.value)}
                    placeholder="e.g. Priya Mehta"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="task-tech">Tech Stack (comma-separated)</Label>
                  <Input
                    id="task-tech"
                    value={taskTech}
                    onChange={(e) => setTaskTech(e.target.value)}
                    placeholder="e.g. React, FastAPI, Python"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="task-status">Status</Label>
                  <select
                    id="task-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {columns.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Task</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((c) => {
            const isHovered = draggedOverCol === c;
            const columnTasks = tasks.filter((t) => t.status === c);
            return (
              <div
                key={c}
                className={`bg-surface-alt rounded-xl p-4 min-h-[260px] border transition-all duration-200 ${
                  isHovered ? "border-primary bg-primary/5 shadow-inner scale-[1.01]" : "border-transparent"
                }`}
                onDragOver={(e) => handleDragOver(e, c)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, c)}
              >
                <div className={`ds-chip ${statusColor[c]} mb-4 font-semibold text-xs`}>{c}</div>
                <div className="space-y-2.5">
                  {columnTasks.map((t) => (
                    <div
                      key={t.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, t.id)}
                      className="bg-card border border-border rounded-xl p-4 cursor-grab active:cursor-grabbing hover:border-primary/50 hover:shadow-md transition-all duration-200"
                    >
                      <p className="text-sm font-semibold text-foreground leading-snug">{t.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <span className="font-medium text-foreground/80">Assignee:</span> {t.assignee}
                      </p>
                      {t.tech && t.tech.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3 pt-2.5 border-t border-border/50">
                          {t.tech.map((tech) => (
                            <span key={tech} className="ds-chip text-[10px] py-0.5 px-2 bg-secondary text-secondary-foreground font-medium">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {columnTasks.length === 0 && (
                    <div className="h-24 border border-dashed border-border/60 rounded-xl flex items-center justify-center text-xs text-muted-foreground select-none">
                      Drag tasks here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="ds-card p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><ActivityIcon className="size-4 text-primary" /> Recent Activity</h3>
        <ul className="space-y-3">
          {[
            { who: "Priya Mehta", what: "pushed 5 commits to matching-engine", when: "1h" },
            { who: "Rohan Verma", what: "moved 'Profile cards' to Review", when: "3h" },
            { who: "Sarah Khan", what: "merged PR #42 — CI pipeline", when: "Yesterday" },
            { who: "Alex Carter", what: "scheduled Sprint Review for Friday", when: "Yesterday" },
          ].map((a, i) => (
            <li key={i} className="flex items-start gap-3">
              <div className="size-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center text-xs font-semibold">{a.who[0]}</div>
              <div className="flex-1"><p className="text-sm"><span className="font-semibold">{a.who}</span> {a.what}</p><p className="text-xs text-muted-foreground">{a.when} ago</p></div>
              <MessageSquare className="size-4 text-muted-foreground" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

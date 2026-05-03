import { team } from "@/data/mock";
import { Calendar, ExternalLink, MessageSquare, Plus, Users, Activity as ActivityIcon } from "lucide-react";
import { Link } from "react-router-dom";

const columns = ["Todo", "In Progress", "Review", "Done"];
const statusColor: Record<string, string> = {
  Todo: "bg-secondary text-muted-foreground",
  "In Progress": "bg-primary-soft text-primary",
  Review: "bg-[hsl(var(--warning)/0.12)] text-warning",
  Done: "bg-success-bg text-success",
};

export default function MyTeam() {
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
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="h-full bg-gradient-primary rounded-full" style={{ width: `${team.sprint.progress}%` }} />
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
          <button className="text-sm font-semibold text-primary inline-flex items-center gap-1"><Plus className="size-4" /> New task</button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((c) => (
            <div key={c} className="bg-surface-alt rounded-xl p-3 min-h-[200px]">
              <div className={`ds-chip ${statusColor[c]} mb-3`}>{c}</div>
              <div className="space-y-2">
                {team.tasks.filter((t) => t.status === c).map((t) => (
                  <div key={t.id} className="bg-card border border-border rounded-lg p-3">
                    <p className="text-sm font-medium">{t.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{t.assignee}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ds-card p-6">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><ActivityIcon className="size-4 text-primary" /> Recent Activity</h3>
        <ul className="space-y-3">
          {[
            { who: "Anshuman", what: "pushed 5 commits to matching-engine", when: "1h" },
            { who: "Ansh", what: "moved 'Profile cards' to Review", when: "3h" },
            { who: "Ambar", what: "merged PR #42 — CI pipeline", when: "Yesterday" },
            { who: "Aditi", what: "scheduled Sprint Review for Friday", when: "Yesterday" },
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

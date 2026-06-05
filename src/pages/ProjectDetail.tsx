import { useParams, Link } from "react-router-dom";
import { useApp } from "@/lib/store";
import { ArrowLeft, Bookmark, CheckCircle2, Circle, Github, MessageSquare, Target, Users } from "lucide-react";

export default function ProjectDetail() {
  const { id } = useParams();
  const { state } = useApp();
  const projectsList = Object.values(state.projects || {});
  const p = projectsList.find((x) => x.id === id);

  if (!p) {
    return (
      <div className="container py-10 text-center">
        <h2 className="text-xl font-bold">Project Not Found</h2>
        <p className="text-muted-foreground mt-2">The requested project is not available.</p>
        <Link to="/find-projects" className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">Back to projects</Link>
      </div>
    );
  }

  return (
    <div className="container py-10 space-y-6">
      <Link to="/find-projects" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="size-4" /> Back to projects</Link>

      <div className="ds-card p-7 bg-gradient-hero">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="ds-chip-primary">{p.status}</span>
            <h1 className="ds-page-title mt-3">{p.title}</h1>
            <p className="text-muted-foreground mt-1">by {p.owner} · {p.team}</p>
          </div>
          <div className="flex gap-2">
            <button className="h-11 px-4 rounded-xl bg-card border border-border text-sm font-semibold inline-flex items-center gap-2 hover:bg-secondary"><Bookmark className="size-4" /> Save</button>
            <button className="h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold inline-flex items-center gap-2 hover:bg-primary-hover">Join Project</button>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mt-6">
          <Stat label="Members" value={`${p.members}/${p.maxMembers}`} />
          <Stat label="Progress" value={`${p.progress}%`} />
          <Stat label="Category" value={p.category} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="ds-card p-6">
            <h3 className="font-semibold text-lg mb-2">Summary</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{p.description} The team is shipping in 2-week sprints with weekly demo sessions and async standups. Mentors review milestones and the project produces a verified portfolio entry on completion.</p>
          </div>

          <div className="ds-card p-6">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2"><Target className="size-4 text-primary" /> Goals</h3>
            <ul className="space-y-2">
              {["Ship MVP in 6 weeks", "Onboard 100 student testers", "Open-source the matching engine", "Publish learnings & demo video"].map((g) => (
                <li key={g} className="flex items-start gap-2 text-sm"><CheckCircle2 className="size-4 text-success mt-0.5" /> {g}</li>
              ))}
            </ul>
          </div>

          <div className="ds-card p-6">
            <h3 className="font-semibold text-lg mb-4">Milestones</h3>
            <div className="space-y-3">
              {[
                { name: "Discovery & wireframes", done: true },
                { name: "MVP backend", done: true },
                { name: "Beta UI shipped", done: true },
                { name: "Pilot with 3 colleges", done: false },
                { name: "Public launch", done: false },
              ].map((m, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-alt border border-border">
                  {m.done ? <CheckCircle2 className="size-5 text-success" /> : <Circle className="size-5 text-muted-foreground" />}
                  <span className={`text-sm ${m.done ? "line-through text-muted-foreground" : "font-medium"}`}>{m.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ds-card p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><MessageSquare className="size-4 text-primary" /> Discussion</h3>
            <div className="space-y-3">
              {[{ u: "Priya Mehta", t: "Pushed v0 of matching scoring — feedback welcome." }, { u: "Rohan Verma", t: "Profile cards in review, demo Friday." }].map((d, i) => (
                <div key={i} className="flex gap-3">
                  <div className="size-9 rounded-lg bg-gradient-primary text-white text-xs font-semibold flex items-center justify-center shrink-0">{d.u[0]}</div>
                  <div className="flex-1"><p className="text-sm"><span className="font-semibold">{d.u}</span> · 2h ago</p><p className="text-sm text-muted-foreground">{d.t}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="ds-card p-6">
            <h3 className="font-semibold text-lg mb-3">Tech Stack</h3>
            <div className="flex flex-wrap gap-1.5">{p.tech.map((t) => <span key={t} className="ds-chip">{t}</span>)}</div>
          </div>

          <div className="ds-card p-6">
            <h3 className="font-semibold text-lg mb-3">Roles Needed</h3>
            <div className="space-y-2">
              {p.roles.map((r) => (
                <div key={r} className="p-3 rounded-xl bg-surface-alt border border-border flex items-center justify-between">
                  <span className="text-sm font-medium">{r}</span><button className="text-xs font-semibold text-primary">Apply</button>
                </div>
              ))}
            </div>
          </div>

          <div className="ds-card p-6">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2"><Users className="size-4 text-primary" /> Contributors</h3>
            <div className="space-y-2">
              {["Alex Carter", "Priya Mehta", "Rohan Verma"].map((c) => (
                <div key={c} className="flex items-center gap-3">
                  <div className="size-9 rounded-lg bg-gradient-primary text-white text-xs font-semibold flex items-center justify-center">{c.split(" ").map(n => n[0]).join("")}</div>
                  <span className="text-sm">{c}</span>
                </div>
              ))}
            </div>
          </div>

          <a href="#" className="ds-card p-4 flex items-center gap-3 hover:bg-secondary">
            <Github className="size-5" /><span className="text-sm font-medium">View on GitHub</span>
          </a>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card/80 backdrop-blur rounded-xl p-4 border border-border">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold mt-0.5">{value}</p>
    </div>
  );
}

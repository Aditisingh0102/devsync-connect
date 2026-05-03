import { Link, useParams } from "react-router-dom";
import { team } from "@/data/mock";
import { ArrowLeft, FileText, Target } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const roleData = [
  { name: "Frontend", value: 35, color: "hsl(var(--primary))" },
  { name: "Backend", value: 30, color: "hsl(var(--cyan))" },
  { name: "ML", value: 20, color: "hsl(var(--purple))" },
  { name: "PM/Design", value: 15, color: "hsl(var(--success))" },
];

export default function TeamDetail() {
  useParams();
  return (
    <div className="container py-10 space-y-6">
      <Link to="/my-team" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="size-4" /> Back</Link>

      <div className="ds-card p-7 bg-gradient-hero">
        <span className="ds-chip-primary">Team</span>
        <h1 className="ds-page-title mt-2">{team.name}</h1>
        <p className="text-muted-foreground mt-1 max-w-2xl">{team.mission}</p>
        <div className="mt-4 flex items-center gap-3 text-sm">
          <span className="ds-chip">Active Project: {team.activeProject}</span>
          <span className="ds-chip">{team.sprint.name} — {team.sprint.progress}%</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="ds-card p-6 lg:col-span-2">
          <h3 className="font-semibold text-lg mb-4">Members</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {team.members.map((m) => (
              <div key={m.name} className="p-4 rounded-xl bg-surface-alt border border-border flex gap-3 items-center">
                <div className="size-11 rounded-xl bg-gradient-primary text-white font-semibold flex items-center justify-center shrink-0">{m.avatar}</div>
                <div><p className="font-semibold text-sm">{m.name}</p><p className="text-xs text-muted-foreground">{m.role}</p></div>
              </div>
            ))}
          </div>
        </div>

        <div className="ds-card p-6">
          <h3 className="font-semibold text-lg mb-2">Role Distribution</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={roleData} dataKey="value" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {roleData.map((d) => <Cell key={d.name} fill={d.color} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {roleData.map((d) => {
              return (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <span className={`size-2.5 rounded-full ${d.color === "success" ? "bg-success" : d.color === "warning" ? "bg-warning" : d.color === "danger" ? "bg-danger" : d.color === "cyan" ? "bg-cyan" : d.color === "purple" ? "bg-purple" : "bg-primary"}`} />{d.name}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="ds-card p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><Target className="size-4 text-primary" /> Deliverables</h3>
          <ul className="space-y-2 text-sm">
            {["MVP demo video", "Beta release notes", "Mentor review report"].map((d) => (
              <li key={d} className="p-3 rounded-xl bg-surface-alt border border-border">{d}</li>
            ))}
          </ul>
        </div>
        <div className="ds-card p-6">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><FileText className="size-4 text-primary" /> Notes & Resources</h3>
          <div className="space-y-2">
            {team.resources.map((r) => (
              <a key={r.title} href={r.url} className="block p-3 rounded-xl hover:bg-secondary text-sm font-medium">{r.title}</a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

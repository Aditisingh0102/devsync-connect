import { useState } from "react";
import { profile } from "@/data/mock";
import { Edit3, Github, Globe, Linkedin, Mail, MapPin, Trophy, UserPlus } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

const tabs = ["Overview", "Projects", "Achievements", "Activity"];

const chartData = [
  { m: "Jan", c: 8 }, { m: "Feb", c: 14 }, { m: "Mar", c: 22 }, { m: "Apr", c: 18 },
  { m: "May", c: 28 }, { m: "Jun", c: 34 }, { m: "Jul", c: 26 }, { m: "Aug", c: 38 },
];

export default function Profile() {
  const [tab, setTab] = useState("Overview");
  const completion = 78;

  return (
    <div className="container py-10 space-y-6">
      <div className="ds-card p-7 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 -z-0 opacity-30">
          <div className="absolute top-0 right-0 size-64 rounded-full bg-primary blur-3xl" />
        </div>
        <div className="relative flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="size-24 rounded-2xl bg-gradient-primary text-white text-3xl font-display font-bold flex items-center justify-center shadow-glow">AS</div>
          <div className="flex-1 min-w-0">
            <h1 className="ds-page-title">{profile.name}</h1>
            <p className="text-muted-foreground">{profile.handle} · {profile.role}</p>
            <p className="text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" /> {profile.college}</span>
              <span className="inline-flex items-center gap-1"><Mail className="size-3.5" /> aditi@iiitd.ac.in</span>
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">{profile.skills.map((s) => <span key={s} className="ds-chip-primary">{s}</span>)}</div>
          </div>
          <div className="flex gap-2">
            <button className="h-10 px-4 rounded-xl bg-card border border-border font-semibold text-sm hover:bg-secondary inline-flex items-center gap-2"><Edit3 className="size-4" /> Edit</button>
            <button className="h-10 px-4 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover inline-flex items-center gap-2"><UserPlus className="size-4" /> Invite to Team</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(profile.stats).map(([k, v]) => (
          <div key={k} className="ds-card p-5">
            <p className="text-sm text-muted-foreground capitalize">{k.replace(/([A-Z])/g, " $1")}</p>
            <p className="text-2xl font-bold mt-1">{v}{k === "matchScore" && "%"}</p>
          </div>
        ))}
      </div>

      <div className="ds-card p-2 inline-flex flex-wrap gap-1">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 h-9 rounded-lg text-sm font-medium transition-colors ${tab === t ? "bg-primary text-white" : "text-muted-foreground hover:bg-secondary"}`}>{t}</button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="ds-card p-6 lg:col-span-2">
            <h3 className="font-semibold text-lg mb-4">Contributions</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="m" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                  <Bar dataKey="c" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6">
              <h4 className="font-semibold text-sm mb-3">Activity Heatmap</h4>
              <div className="grid grid-cols-[repeat(26,1fr)] gap-1">
                {Array.from({ length: 26 * 7 }).map((_, i) => {
                  const lvl = Math.floor(Math.random() * 5);
                  const colors = ["bg-secondary", "bg-primary/20", "bg-primary/40", "bg-primary/70", "bg-primary"];
                  return <div key={i} className={`aspect-square rounded-sm ${colors[lvl]}`} />;
                })}
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="ds-card p-6">
              <h3 className="font-semibold text-lg">Profile Completion</h3>
              <div className="flex items-end gap-2 mt-3"><span className="text-3xl font-bold">{completion}%</span><span className="text-xs text-muted-foreground mb-1">3 steps left</span></div>
              <div className="h-2 bg-secondary rounded-full mt-3 overflow-hidden"><div className="h-full bg-gradient-primary rounded-full" style={{ width: `${completion}%` }} /></div>
              <ul className="mt-4 space-y-2 text-sm">
                {["Add portfolio link", "Verify college email", "Add 2 more skills"].map((s) => (
                  <li key={s} className="flex items-center gap-2 text-muted-foreground"><div className="size-1.5 rounded-full bg-primary" /> {s}</li>
                ))}
              </ul>
            </div>
            <div className="ds-card p-6">
              <h3 className="font-semibold text-lg mb-3">Links</h3>
              <div className="space-y-2">
                <a href={profile.links.github} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary"><Github className="size-4" /><span className="text-sm">GitHub</span></a>
                <a href={profile.links.linkedin} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary"><Linkedin className="size-4" /><span className="text-sm">LinkedIn</span></a>
                <a href={profile.links.portfolio} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary"><Globe className="size-4" /><span className="text-sm">Portfolio</span></a>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "Projects" && (
        <div className="ds-card p-6">
          <h3 className="font-semibold text-lg mb-4">Contributed Projects</h3>
          <div className="space-y-3">
            {profile.contributedProjects.map((p) => (
              <div key={p} className="flex items-center justify-between p-4 rounded-xl bg-surface-alt border border-border">
                <div><p className="font-semibold">{p}</p><p className="text-xs text-muted-foreground">12 commits · 3 PRs merged</p></div>
                <span className="ds-chip-primary">Active</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "Achievements" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {profile.achievements.map((a) => (
            <div key={a.name} className="ds-card p-5 text-center">
              <div className="size-14 rounded-2xl bg-gradient-primary text-white mx-auto flex items-center justify-center mb-3 shadow-glow"><Trophy className="size-6" /></div>
              <p className="font-semibold text-sm">{a.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{a.date}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "Activity" && (
        <div className="ds-card p-6">
          <ul className="space-y-3">
            {["Joined DevSync Team Match AI", "Completed Sprint 3", "Earned 'Team Lead' badge", "Pushed 12 commits to Campus Connect"].map((t, i) => (
              <li key={i} className="p-3 rounded-xl bg-surface-alt border border-border text-sm">{t}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Sparkles, Users2, Compass, LayoutDashboard, Activity, Brain,
  Shield, UserPlus, Search as SearchIcon, Hammer, Github, Rocket, Trophy,
  Briefcase, Zap, Globe, MessageSquare, TrendingUp, Star, CheckCircle2
} from "lucide-react";
import { activities, projects, skills } from "@/data/mock";
import ProjectCard from "@/components/ProjectCard";

const Hero3D = lazy(() => import("@/components/Hero3D"));

const stats = [
  { label: "Active Projects", value: "1,240", change: "+12%", icon: Compass, color: "text-primary bg-primary-soft" },
  { label: "Students", value: "8.6K", change: "+24%", icon: Users2, color: "text-cyan bg-[hsl(var(--cyan)/0.1)]" },
  { label: "Teams Formed", value: "320", change: "+8%", icon: LayoutDashboard, color: "text-purple bg-[hsl(var(--purple)/0.1)]" },
  { label: "Match Score", value: "92%", change: "+3%", icon: TrendingUp, color: "text-success bg-success-bg" },
];

const features = [
  { icon: Brain, title: "Skill-Based Team Matching", desc: "Smart pairing across complementary skills, availability, and goals." },
  { icon: Compass, title: "Project Discovery & Sharing", desc: "Browse curated student projects and post your own in seconds." },
  { icon: LayoutDashboard, title: "Team Dashboard", desc: "One workspace for sprints, members, tasks, and resources." },
  { icon: Activity, title: "Real-Time Progress Tracking", desc: "Sprints, milestones, and contribution insights — live." },
  { icon: Sparkles, title: "AI-Driven Recommendations", desc: "Personalized project & teammate suggestions.", soon: true },
  { icon: Shield, title: "Verified College Profiles", desc: "Trusted student identity with secure ERP login." },
];

const steps = [
  { icon: Shield, title: "Secure College Login", desc: "Sign in with your verified ERP / college account." },
  { icon: UserPlus, title: "Profile Setup", desc: "Add skills, interests, year, and preferred roles." },
  { icon: LayoutDashboard, title: "Personal Dashboard", desc: "Your projects, teams, and matches in one view." },
  { icon: SearchIcon, title: "Find / Post Projects", desc: "Discover real-world projects or post your own idea." },
  { icon: Hammer, title: "Build & Collaborate", desc: "Form teams, ship sprints, build verified experience." },
];

const roadmap = [
  { icon: Brain, title: "AI Team Matching", tag: "Coming Soon", color: "purple" },
  { icon: MessageSquare, title: "Real-Time Collaboration", tag: "In Design", color: "primary" },
  { icon: Github, title: "GitHub Integration", tag: "Roadmap", color: "primary" },
  { icon: Globe, title: "Multi-College Expansion", tag: "Q3 2026", color: "cyan" },
  { icon: Trophy, title: "Gamification", tag: "Exploring", color: "warning" },
  { icon: Briefcase, title: "Internships & Jobs", tag: "Roadmap", color: "success" },
];

export default function Index() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute inset-0 -z-0">
          <div className="absolute top-20 -left-32 size-96 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute bottom-0 right-10 size-96 rounded-full bg-purple/20 blur-3xl" />
        </div>
        <div className="container relative grid lg:grid-cols-2 gap-12 items-center py-16 md:py-24">
          <div className="animate-fade-up">
            <span className="ds-chip-primary mb-5"><Sparkles className="size-3.5" /> For ambitious students</span>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
              Connect.<br />
              <span className="bg-gradient-primary bg-clip-text text-transparent">Collaborate.</span><br />
              Build.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              DevSync is the student collaboration platform to discover real-world projects, find skill-matched teammates, ship together, and build a verified portfolio for internships and careers.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/find-projects" className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-primary text-primary-foreground font-semibold shadow-glow hover:bg-primary-hover transition-all">
                Explore Projects <ArrowRight className="size-4" />
              </Link>
              <Link to="/onboarding/profile-setup" className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-card border border-border font-semibold hover:bg-secondary transition-all">
                Complete Profile
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {["AS", "AN", "AG", "AK"].map((a, i) => (
                  <div key={a} className="size-8 rounded-full ring-2 ring-background bg-gradient-primary text-white text-xs font-semibold flex items-center justify-center" style={{ zIndex: 10 - i }}>{a}</div>
                ))}
              </div>
              <div><span className="font-semibold text-foreground">8.6K+ students</span> already syncing</div>
            </div>
          </div>

          <div className="relative h-[420px] md:h-[520px] rounded-3xl overflow-hidden ds-card shadow-card">
            <Suspense fallback={<div className="absolute inset-0 bg-gradient-primary opacity-10 animate-pulse" />}>
              <Hero3D className="absolute inset-0" />
            </Suspense>
            <div className="absolute top-4 left-4 glass-panel rounded-xl px-3 py-2 text-xs font-medium border border-border">
              <span className="inline-flex items-center gap-1.5"><span className="size-2 rounded-full bg-success animate-pulse" /> Live network · 8.6K nodes</span>
            </div>
            <div className="absolute bottom-4 right-4 glass-panel rounded-xl px-3 py-2 text-xs border border-border">
              <div className="font-semibold">Skill Match</div>
              <div className="text-primary font-bold text-lg">92%</div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="container -mt-8 md:-mt-12 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="ds-card p-5">
              <div className={`size-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                <s.icon className="size-5" />
              </div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                {s.label} <span className="text-success text-xs font-semibold">{s.change}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* RECOMMENDED PROJECTS */}
      <section className="container py-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="ds-chip-primary mb-2">Recommended for you</span>
            <h2 className="ds-section-title mt-2">Projects matching your skills</h2>
          </div>
          <Link to="/find-projects" className="text-sm font-semibold text-primary hover:text-primary-hover hidden md:flex items-center gap-1">
            View all <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.slice(0, 3).map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      </section>

      {/* ACTIVITY + SKILL MATCH */}
      <section className="container grid lg:grid-cols-3 gap-5 pb-20">
        <div className="ds-card p-6 lg:col-span-2">
          <h3 className="font-semibold text-lg mb-5">Recent Activity</h3>
          <div className="relative pl-6 space-y-5">
            <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
            {activities.map((a) => (
              <div key={a.id} className="relative">
                <div className="absolute -left-[18px] top-1.5 size-3 rounded-full bg-gradient-primary ring-4 ring-background" />
                <p className="text-sm text-foreground">{a.text}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{a.time}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="ds-card p-6">
          <h3 className="font-semibold text-lg mb-5">Your Skill Match</h3>
          <div className="space-y-4">
            {skills.slice(0, 5).map((s, i) => {
              const v = [92, 78, 64, 55, 48][i];
              return (
                <div key={s}>
                  <div className="flex justify-between text-sm mb-1.5"><span className="font-medium">{s}</span><span className="text-muted-foreground">{v}%</span></div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-primary rounded-full" style={{ width: `${v}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* KEY FEATURES */}
      <section className="bg-surface-alt border-y border-border py-20">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="ds-chip-primary">Key Features</span>
            <h2 className="ds-section-title mt-3">Everything you need to ship together</h2>
            <p className="text-muted-foreground mt-3">Designed around how students actually find teams, build, and grow.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="ds-card ds-card-hover p-6 relative">
                {f.soon && <span className="absolute top-4 right-4 ds-chip bg-[hsl(var(--purple)/0.12)] text-purple">Coming Soon</span>}
                <div className="size-11 rounded-xl bg-gradient-primary text-white flex items-center justify-center mb-4 shadow-glow">
                  <f.icon className="size-5" />
                </div>
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground mt-1.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="ds-chip-primary">How it works</span>
          <h2 className="ds-section-title mt-3">From login to launch in 5 steps</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map((s, i) => (
            <div key={s.title} className="ds-card p-5 relative">
              <div className="absolute -top-3 -left-3 size-8 rounded-xl bg-gradient-primary text-white text-sm font-bold flex items-center justify-center shadow-glow">
                {i + 1}
              </div>
              <s.icon className="size-6 text-primary mb-3 mt-1" />
              <h3 className="font-semibold text-sm">{s.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ROADMAP */}
      <section className="bg-surface-alt border-y border-border py-20">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="ds-chip-primary"><Rocket className="size-3.5" /> Roadmap</span>
            <h2 className="ds-section-title mt-3">What's next for DevSync</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {roadmap.map((r) => (
              <div key={r.title} className="ds-card ds-card-hover p-5 flex items-center gap-4">
                <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 bg-${r.color}/10 text-${r.color}`} style={{ background: `hsl(var(--${r.color === "warning" ? "warning" : r.color === "success" ? "success" : r.color}) / 0.1)`, color: `hsl(var(--${r.color === "warning" ? "warning" : r.color === "success" ? "success" : r.color}))` }}>
                  <r.icon className="size-5" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{r.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{r.tag}</div>
                </div>
                <ArrowRight className="size-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-10 md:p-16 text-center text-white shadow-glow">
          <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(circle at 30% 50%, white, transparent 50%)" }} />
          <div className="relative">
            <h2 className="font-display text-3xl md:text-5xl font-bold">Start syncing with your next team.</h2>
            <p className="mt-3 text-white/85 max-w-xl mx-auto">Join thousands of students discovering projects, building teams, and shipping real-world experience.</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link to="/onboarding/profile-setup" className="h-12 px-6 rounded-xl bg-white text-primary font-semibold inline-flex items-center gap-2 hover:bg-white/90 transition-all">
                Get started <Zap className="size-4" />
              </Link>
              <Link to="/find-projects" className="h-12 px-6 rounded-xl bg-white/10 border border-white/20 backdrop-blur font-semibold inline-flex items-center gap-2 hover:bg-white/20 transition-all">
                Browse projects
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

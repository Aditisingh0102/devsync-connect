import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight, Sparkles, Users2, Compass, LayoutDashboard, Activity, Brain,
  Shield, UserPlus, Search as SearchIcon, Hammer, Github, Rocket, Trophy,
  Briefcase, Zap, Globe, MessageSquare, TrendingUp, Star, CheckCircle2, X
} from "lucide-react";
import ProjectCard from "@/components/ProjectCard";
import { useApp } from "@/lib/store";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import Hero3D from "@/components/Hero3D";



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
  { icon: Brain, title: "AI Team Matching", tag: "Coming Soon", color: "purple", description: "We are building an intelligent matching engine that pairs you with teammates based on complementary skills, timezone, and project goals. Imagine instantly finding the perfect backend developer for your React frontend!" },
  { icon: MessageSquare, title: "Real-Time Collaboration", tag: "In Design", color: "primary", description: "Integrated chat, live task boards, and video huddles right within your project workspace. No more switching between Discord, Slack, and Trello just to get your student project done." },
  { icon: Github, title: "GitHub Integration", tag: "Roadmap", color: "primary", description: "Sync your GitHub commits directly to your project's activity feed. Automatically update task statuses when you merge pull requests and build a verified portfolio of your code contributions." },
  { icon: Globe, title: "Multi-College Expansion", tag: "Q3 2026", color: "cyan", description: "Currently limited to select universities, we plan to open DevSync to a global network of colleges. You'll be able to form cross-university teams and participate in inter-college hackathons." },
  { icon: Trophy, title: "Gamification", tag: "Exploring", color: "warning", description: "Earn badges, level up your developer profile, and gain reputation points by helping others, shipping projects on time, and receiving positive peer reviews." },
  { icon: Briefcase, title: "Internships & Jobs", tag: "Roadmap", color: "success", description: "Top companies are looking for proven builders. We will connect your DevSync portfolio directly with recruiters, allowing them to hire you based on the real projects you've shipped." },
];

export default function Index() {
  const { state } = useApp();
  const navigate = useNavigate();
  const [loginModalSource, setLoginModalSource] = useState<"teams" | "projects" | null>(null);
  const [selectedRoadmapItem, setSelectedRoadmapItem] = useState<typeof roadmap[0] | null>(null);
  const isLoggedIn = !!state.currentUser;
  const isProfileComplete = !!state.currentUser?.profileCompleted;
  const showLoginModal = loginModalSource !== null;

  // Fetch live registered users from backend
  const [liveUsers, setLiveUsers] = useState<Array<{id: number; username: string; name: string | null; avatar: string | null}>>([
  ]);
  useEffect(() => {
    fetch('https://16.170.255.194.nip.io/api/v1/users/')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setLiveUsers(data); })
      .catch(() => {});
  }, []);

  const projects = useMemo(() => Object.values(state.projects || {}), [state.projects]);

  const workingProjectsCount = useMemo(() => {
    if (!state.currentUser) return 0;
    return Object.values(state.projects || {}).filter(
      (p) => p.ownerId === state.currentUser?.id || p.memberIds?.includes(state.currentUser?.id)
    ).length;
  }, [state.currentUser, state.projects]);

  const myTeamsCount = useMemo(() => {
    if (!state.currentUser) return 0;
    const userProjects = Object.values(state.projects || {}).filter(
      (p) => p.ownerId === state.currentUser?.id || p.memberIds?.includes(state.currentUser?.id)
    );
    if (userProjects.length === 0) return 0;

    const uniqueMemberIds = new Set<string>();
    userProjects.forEach((p) => {
      if (p.ownerId) uniqueMemberIds.add(p.ownerId);
      if (p.memberIds) {
        p.memberIds.forEach((id) => uniqueMemberIds.add(id));
      }
    });
    return uniqueMemberIds.size;
  }, [state.currentUser, state.projects]);

  const matchScore = useMemo(() => {
    if (!state.currentUser || !state.currentUser.skills || state.currentUser.skills.length === 0) {
      return 0;
    }
    const userSkills = state.currentUser.skills.map((s) => s.toLowerCase().trim());
    const projectsList = Object.values(state.projects || {});
    if (projectsList.length === 0) return 0;

    const scores = projectsList.map((p) => {
      const tech = p.tech || [];
      if (tech.length === 0) return 0;
      const matches = tech.filter((t) => userSkills.includes(t.toLowerCase().trim())).length;
      return (matches / tech.length) * 100;
    });

    // Sort descending and take top 3 projects to represent best match compatibility
    scores.sort((a, b) => b - a);
    const topScores = scores.slice(0, 3);
    const avg = topScores.reduce((sum, s) => sum + s, 0) / topScores.length;
    return Math.round(avg);
  }, [state.currentUser, state.projects]);

  const averagePlatformMatchScore = useMemo(() => {
    const usersList = Object.values(state.users || {});
    const projectsList = Object.values(state.projects || {});
    if (usersList.length === 0 || projectsList.length === 0) return 0;

    let totalScoresSum = 0;
    let validUsersCount = 0;

    usersList.forEach((u) => {
      if (u.skills && u.skills.length > 0) {
        const uSkills = u.skills.map((s) => s.toLowerCase().trim());
        const scores = projectsList.map((p) => {
          const tech = p.tech || [];
          if (tech.length === 0) return 0;
          const matches = tech.filter((t) => uSkills.includes(t.toLowerCase().trim())).length;
          return (matches / tech.length) * 100;
        });
        scores.sort((a, b) => b - a);
        const topScores = scores.slice(0, 3);
        const avg = topScores.reduce((sum, s) => sum + s, 0) / topScores.length;
        totalScoresSum += avg;
        validUsersCount++;
      }
    });

    return validUsersCount > 0 ? Math.round(totalScoresSum / validUsersCount) : 0;
  }, [state.users, state.projects]);

  const matchScoreChange = useMemo(() => {
    if (!state.currentUser || matchScore === 0) return "0%";
    const diff = matchScore - averagePlatformMatchScore;
    if (diff > 0) return `+${Math.round(diff)}%`;
    if (diff < 0) return `${Math.round(diff)}%`;
    return "0%";
  }, [matchScore, averagePlatformMatchScore, state.currentUser]);

  const [backendStats, setBackendStats] = useState<{active_projects: number; working_builders: number; average_match_score: number} | null>(null);
  useEffect(() => {
    fetch('https://16.170.255.194.nip.io/api/v1/home/stats')
      .then(r => r.json())
      .then(data => setBackendStats(data))
      .catch(() => {});
  }, []);

  const totalProjectsCount = useMemo(() => {
    if (backendStats) return backendStats.active_projects;
    return Object.keys(state.projects || {}).length;
  }, [state.projects, backendStats]);

  const stats = useMemo(() => [
    { label: "Active Projects", value: totalProjectsCount.toString(), change: totalProjectsCount > 0 ? "Live" : "0", icon: Compass, color: "text-primary bg-primary-soft", route: "/find-projects" },
    { label: "Builders Online", value: (backendStats?.working_builders || liveUsers.length).toString(), change: liveUsers.length > 0 ? "Active" : "0", icon: Briefcase, color: "text-cyan bg-[hsl(var(--cyan)/0.1)]" },
    { label: "My Team", value: myTeamsCount.toString(), change: myTeamsCount > 0 ? "Active" : "—", icon: LayoutDashboard, color: "text-purple bg-[hsl(var(--purple)/0.1)]" },
    { label: state.currentUser ? "Your Match Score" : "Avg Match Score", value: `${state.currentUser ? matchScore : (backendStats?.average_match_score || 0)}%`, change: matchScoreChange, icon: TrendingUp, color: "text-success bg-success-bg" },
  ], [totalProjectsCount, liveUsers.length, myTeamsCount, matchScore, matchScoreChange, backendStats]);

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
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl">
              DevSync is the student collaboration platform to discover real-world projects, find skill-matched teammates, ship together, and build a verified portfolio for internships and careers.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/find-projects" className="inline-flex items-center gap-2 h-12 px-6 rounded-xl bg-primary text-primary-foreground font-semibold shadow-glow hover:bg-primary-hover transition-all">
                Explore Projects <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {liveUsers.slice(0, 5).map((u, i) => {
                  const depthClasses = ["z-50", "z-40", "z-30", "z-20", "z-10"];
                  const initials = (u.name || u.username || 'U').substring(0, 2).toUpperCase();
                  return (
                    <div key={u.id} className={`size-8 rounded-full ring-2 ring-background bg-gradient-primary text-white text-xs font-semibold flex items-center justify-center ${depthClasses[i]}`}>
                      {initials}
                    </div>
                  );
                })}
              </div>
              <div><span className="font-semibold text-foreground">{liveUsers.length} students</span> already syncing</div>
            </div>
          </div>

          <div className="relative h-[420px] md:h-[520px] rounded-3xl overflow-hidden ds-card shadow-card">
            <Suspense fallback={<div className="absolute inset-0 bg-gradient-primary opacity-10 animate-pulse" />}>
              <Hero3D className="absolute inset-0" />
            </Suspense>
            <div className="absolute bottom-4 right-4 glass-panel rounded-xl px-4 py-3 text-xs border border-border">
              <div className="font-semibold uppercase tracking-wider text-[10px] text-muted-foreground mb-1">Design Quality</div>
              <div className="text-primary font-display font-extrabold text-2xl">5%</div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="container -mt-8 md:-mt-12 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => {
            const isMyTeam = s.label === "My Team";
            const isActiveProjects = s.label === "Active Projects";
            const handleCardClick = () => {
              if (isMyTeam) {
                if (isLoggedIn) {
                  navigate("/my-team");
                } else {
                  setLoginModalSource("teams");
                }
              } else if (isActiveProjects) {
                navigate(s.route || "/find-projects");
              }
            };
            
            const isClickable = isMyTeam || isActiveProjects;
            
            return (
              <div 
                key={s.label} 
                className={`ds-card p-5 ${isClickable ? "ds-card-hover cursor-pointer" : ""}`}
                onClick={handleCardClick}
              >
                <div className={`size-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                  <s.icon className="size-5" />
                </div>
                <div className="font-display text-3xl font-extrabold tracking-tighter">{s.value}</div>
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  {s.label} <span className="text-success text-xs font-bold">{s.change}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* RECOMMENDED PROJECTS */}
      <section className="container py-20 overflow-hidden">
        <Carousel opts={{ align: "start" }} className="w-full">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="ds-chip-primary mb-2">Recommended for you</span>
              <h2 className="ds-section-title mt-2">Projects matching your skills</h2>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/find-projects" className="hidden md:inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-primary text-white font-semibold shadow-glow hover:bg-primary-hover transition-all">
                View all <ArrowRight className="size-4" />
              </Link>
              <div className="flex items-center gap-1.5 md:ml-4">
                <CarouselPrevious className="static translate-y-0 h-10 w-10 border-border bg-card hover:bg-secondary text-foreground" />
                <CarouselNext className="static translate-y-0 h-10 w-10 border-border bg-card hover:bg-secondary text-foreground" />
              </div>
            </div>
          </div>
          <CarouselContent className="-ml-5">
            {projects.map((p) => (
              <CarouselItem key={p.id} className="pl-5 md:basis-1/2 lg:basis-1/3">
                <ProjectCard
                  project={p}
                  gateProjectDetails={!isLoggedIn}
                  onProjectDetailsBlocked={() => setLoginModalSource("projects")}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>

      {/* KEY FEATURES */}
      <section className="bg-surface-alt border-y border-border py-20">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="ds-chip-primary">Key Features</span>
            <h2 className="ds-section-title mt-3">Everything you need to ship together</h2>
            <p className="text-muted-foreground leading-relaxed text-lg mt-3">Designed around how students actually find teams, build, and grow.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div key={f.title} className="ds-card ds-card-hover p-6 relative">
                {f.soon && <span className="absolute top-4 right-4 ds-chip bg-[hsl(var(--purple)/0.12)] text-purple">Coming Soon</span>}
                <div className="size-11 rounded-xl bg-gradient-primary text-white flex items-center justify-center mb-4 shadow-glow">
                  <f.icon className="size-5" />
                </div>
                <h3 className="font-semibold text-lg">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mt-2">{f.desc}</p>
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
              <p className="text-sm text-muted-foreground leading-relaxed mt-1.5">{s.desc}</p>
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
            {roadmap.map((r, i) => (
              <div 
                key={r.title} 
                onClick={() => isLoggedIn && setSelectedRoadmapItem(r)}
                className={`ds-card p-5 flex items-center gap-4 transition-all duration-300 ${isLoggedIn ? "cursor-pointer hover:scale-[1.03] hover:shadow-lg hover:border-primary/40 group" : "opacity-95"}`}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                  <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-500 ${isLoggedIn ? "group-hover:rotate-6 group-hover:scale-110" : ""} ${r.color === "warning" ? "bg-warning/10 text-warning" : r.color === "success" ? "bg-success/10 text-success" : r.color === "danger" ? "bg-danger/10 text-danger" : r.color === "cyan" ? "bg-cyan/10 text-cyan" : r.color === "purple" ? "bg-purple/10 text-purple" : "bg-primary/10 text-primary"}`}>
                  <r.icon className="size-5" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{r.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{r.tag}</div>
                </div>
                <ArrowRight className={`size-4 transition-all duration-300 ${isLoggedIn ? "text-muted-foreground group-hover:translate-x-1 group-hover:text-primary" : "text-border"}`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-10 md:p-16 text-center text-white shadow-glow cta-glow">
          <div className="relative">
            <h2 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">Start syncing with your next team.</h2>
            <p className="mt-4 text-white/90 leading-relaxed text-lg max-w-xl mx-auto">Join thousands of students discovering projects, building teams, and shipping real-world experience.</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link to="/onboarding/profile-setup" className="h-12 px-6 rounded-xl bg-card text-foreground border border-border font-semibold inline-flex items-center gap-2 hover:bg-secondary transition-all">
                Get started <Zap className="size-4" />
              </Link>
              <Link to="/find-projects" className="h-12 px-6 rounded-xl bg-secondary/70 border border-border backdrop-blur font-semibold inline-flex items-center gap-2 hover:bg-secondary transition-all">
                Browse projects
              </Link>
            </div>
          </div>
        </div>
      </section>

      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setLoginModalSource(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-5" />
            </button>
            <div className="text-center mb-6 mt-2">
              <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users2 className="size-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Login Required</h3>
              <p className="text-muted-foreground text-sm">
                {loginModalSource === "projects"
                  ? "If you want to view project details, enroll in projects, collaborate with teams, and track your applications, please log in. New here? Create an account to get started and unlock all project opportunities."
                  : "If you want to see your enrolled teams or manage your contributions, please log in. Don't have an account? Don't worry, create one here!"}
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link 
                to="/login" 
                className="w-full h-11 rounded-xl bg-primary text-white font-semibold flex items-center justify-center hover:bg-primary-hover shadow-glow transition-all"
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="w-full h-11 rounded-xl bg-secondary text-foreground font-semibold flex items-center justify-center border border-border hover:bg-secondary/80 transition-all"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      )}

      {selectedRoadmapItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-lg p-8 relative animate-in zoom-in-90 slide-in-from-bottom-10 duration-500">
            <button 
              onClick={() => setSelectedRoadmapItem(null)}
              className="absolute top-5 right-5 size-8 flex items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
            >
              <X className="size-4" />
            </button>
            <div className={`size-16 rounded-2xl flex items-center justify-center mb-6 shadow-glow animate-pulse ${selectedRoadmapItem.color === "warning" ? "bg-warning/20 text-warning" : selectedRoadmapItem.color === "success" ? "bg-success/20 text-success" : selectedRoadmapItem.color === "danger" ? "bg-danger/20 text-danger" : selectedRoadmapItem.color === "cyan" ? "bg-cyan/20 text-cyan" : selectedRoadmapItem.color === "purple" ? "bg-purple/20 text-purple" : "bg-primary/20 text-primary"}`}>
              <selectedRoadmapItem.icon className="size-8" />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-xs font-semibold mb-4">
              <Sparkles className="size-3.5 text-primary" /> {selectedRoadmapItem.tag}
            </div>
            <h3 className="font-display text-3xl font-extrabold tracking-tight mb-3">{selectedRoadmapItem.title}</h3>
            <p className="text-muted-foreground text-base leading-relaxed mb-8">
              {selectedRoadmapItem.description}
            </p>
            <button
              onClick={() => setSelectedRoadmapItem(null)}
              className="w-full h-12 rounded-xl bg-primary text-white font-semibold flex items-center justify-center hover:bg-primary-hover shadow-glow transition-all active:scale-[0.98]"
            >
              Awesome, can't wait!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

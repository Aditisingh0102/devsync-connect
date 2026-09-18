import { useState, lazy, Suspense, useMemo, useEffect } from "react";
import { Edit3, Github, Globe, Linkedin, Mail, MapPin, Trophy, Inbox, Users, Send, FolderOpen, Bookmark, Telescope, Loader2 } from "lucide-react";
import AvatarUpload from "@/components/AvatarUpload";
import ProfileHero3D from "@/components/ProfileHero3D";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useApp } from "@/lib/store";
import { api, getToken } from "@/lib/api";
import PostCard from "@/components/PostCard";
import FollowListModal from "@/components/FollowListModal";
import ProjectCard from "@/components/ProjectCard";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const tabs = ["Overview", "Posts", "Projects", "Activity", "Network", "Requests"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-card border border-border p-3 rounded-xl shadow-lg text-sm z-50 min-w-[150px]">
        <p className="font-semibold mb-1">{label}</p>
        <p className="text-primary font-medium">{data.c} Contributions</p>
        {data.projects && data.projects.length > 0 && (
          <div className="mt-2 space-y-1">
            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Projects</p>
            <ul className="list-disc pl-4 text-xs text-muted-foreground">
              {data.projects.map((p: string, i: number) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }
  return null;
};

const getMonthLabels = (): Record<number, string> => {
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayDay = today.getDay();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - (52 * 7 + todayDay));

  const labels: Record<number, string> = {};
  let lastMonth = -1;
  for (let col = 0; col < 53; col++) {
    // First day (Sunday) of each column/week
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + col * 7);
    const m = d.getMonth();
    if (m !== lastMonth) {
      labels[col] = monthNames[m];
      lastMonth = m;
    }
  }
  return labels;
};

// Helper for deterministic random based on a seed
const seededRandom = (seed: number) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

export default function Profile() {
  const [searchParams] = useSearchParams();
  const queryTab = searchParams.get("tab");
  const [tab, setTab] = useState("Overview");
  const completion = 78;

  useEffect(() => {
    if (queryTab) {
      setTab(queryTab);
    }
  }, [queryTab]);
  const { state } = useApp();
  const params = useParams();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const targetUsername = params.id || state.currentUser?.username;
  const isOwnProfileRoute = !params.id;
  const isLoggedIn = !!state.currentUser;
  
  useEffect(() => {
    if (!targetUsername) {
      setLoading(false);
      return;
    }
    api.getUserProfile(targetUsername)
      .then(data => setProfile(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [targetUsername]);

  const activityHistory: Record<string, number> = useMemo(() => {
    const history: Record<string, number> = { ...(profile?.loginHistory || {}) };
    
    const posts = profile?.posts_by_user || [];
    posts.forEach((post: any) => {
      const d = post.created_at || post.createdAt;
      if (d) {
        try {
          const dateKey = new Date(d).toISOString().slice(0, 10);
          history[dateKey] = (history[dateKey] || 0) + 1;
        } catch(e) {}
      }
    });

    const projects = profile?.working_projects || [];
    projects.forEach((proj: any) => {
      const d = proj.created_at || proj.createdAt;
      if (d) {
        try {
          const dateKey = new Date(d).toISOString().slice(0, 10);
          history[dateKey] = (history[dateKey] || 0) + 1;
        } catch(e) {}
      }
    });

    // Add deterministic mock activity for demonstration so the heatmap is colorful
    const usernameSeed = (profile?.username || "builder").split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const cellDate = new Date(today);
      cellDate.setDate(today.getDate() - i);
      const dateKey = cellDate.toISOString().slice(0, 10);
      
      // If there's no real activity on this day, generate mock activity
      if (!history[dateKey]) {
        const rand = seededRandom(usernameSeed + i);
        // ~35% chance to have some activity
        if (rand > 0.65) {
          history[dateKey] = Math.floor((rand - 0.65) * 12) + 1; // 1 to 4+ contributions
        }
      }
    }

    return history;
  }, [profile?.loginHistory, profile?.posts_by_user, profile?.working_projects, profile?.username]);

  const contributions = useMemo(() => {

    // Build a 53×7 grid (371 cells) ending on today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDay = today.getDay(); // 0=Sun, 6=Sat
    const totalCells = 53 * 7;
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (52 * 7 + todayDay));

    // Find the max count for scaling
    const values = Object.values(activityHistory);
    const maxCount = values.length > 0 ? Math.max(...values, 1) : 1;

    const data: number[] = [];
    for (let i = 0; i < totalCells; i++) {
      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + i);
      const dateKey = cellDate.toISOString().slice(0, 10);

      // If the cell is in the future, show level 0
      if (cellDate > today) {
        data.push(0);
        continue;
      }

      const count = activityHistory[dateKey] || 0;
      if (count === 0) {
        data.push(0);
      } else if (maxCount <= 4) {
        // For low activity users, map count directly to levels (capped at 4)
        data.push(Math.min(count, 4));
      } else {
        // Scale relative to the user's max activity
        const ratio = count / maxCount;
        if (ratio > 0.75) data.push(4);
        else if (ratio > 0.5) data.push(3);
        else if (ratio > 0.25) data.push(2);
        else data.push(1);
      }
    }
    return data;
  }, [activityHistory]);

  const profileTabs = useMemo(() => {
    if (state.currentUser && profile?.id === state.currentUser.id) {
      return ["Overview", "Posts", "Saved", "Projects", "Working Projects", "Activity", "Network", "Requests"];
    }
    return ["Overview", "Posts", "Projects", "Working Projects", "Activity", "Network"];
  }, [state.currentUser, profile?.id]);

  const profilePosts = useMemo(() => profile?.posts_by_user || [], [profile?.posts_by_user]);

  const dynamicChartData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dataMap: Record<string, { m: string, c: number, projects: string[], sortOrder: number }> = {};
    
    const today = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const mName = months[d.getMonth()];
      dataMap[mName] = { m: mName, c: 0, projects: [], sortOrder: d.getTime() };
    }
    
    // Add counts from activityHistory
    Object.entries(activityHistory).forEach(([dateStr, count]) => {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return;
      
      // Ensure the activity is within the last ~12 months
      const diffTime = today.getTime() - d.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      if (diffDays >= 0 && diffDays <= 12 * 31) {
        const mName = months[d.getMonth()];
        if (dataMap[mName]) {
          dataMap[mName].c += count;
        }
      }
    });

    // Extract project names from posts
    profilePosts.forEach((post: any) => {
      const d = new Date(post.created_at || post.createdAt);
      if (isNaN(d.getTime())) return;
      const mName = months[d.getMonth()];
      if (dataMap[mName]) {
        const pName = post.project_name || post.projectName;
        if (pName && !dataMap[mName].projects.includes(pName)) {
           dataMap[mName].projects.push(pName);
        }
      }
    });

    // Extract project names from working projects
    const workingProjects = profile?.working_projects || [];
    workingProjects.forEach((proj: any) => {
      const d = new Date(proj.created_at || proj.createdAt);
      if (isNaN(d.getTime())) return;
      const mName = months[d.getMonth()];
      if (dataMap[mName]) {
        const pName = proj.title || proj.name || proj.projectName;
        if (pName && !dataMap[mName].projects.includes(pName)) {
           dataMap[mName].projects.push(pName);
        }
      }
    });

    return Object.values(dataMap).sort((a, b) => a.sortOrder - b.sortOrder).map(({ sortOrder, ...rest }) => rest);
  }, [profilePosts, activityHistory, profile?.working_projects]);

  const savedPosts = useMemo(() => profile?.saved_posts || [], [profile?.saved_posts]);

  const savedProjects = useMemo(() => profile?.saved_projects || [], [profile?.saved_projects]);

  const workingProjects = useMemo(() => profile?.working_projects || [], [profile?.working_projects]);

  const matchScore = useMemo(() => {
    if (!profile || !profile.skills || profile.skills.length === 0) {
      return 0;
    }
    const userSkills = profile.skills.map((s: string) => s.toLowerCase().trim());
    const projectsList = Object.values(state.projects || {});
    if (projectsList.length === 0) return 0;

    const scores = projectsList.map((p: any) => {
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
  }, [profile?.skills, state.projects]);

  const isOwnProfile = state.currentUser && profile?.id === state.currentUser.id;
  const profileStats: any = {
    posts: profilePosts.length,
    followers: profile?.follower_count ?? 0,
    following: profile?.following_count ?? 0,
  };
  if (isOwnProfile) {
    profileStats.pendingRequests = profile?.pending_requests_count ?? 0;
  }
  profileStats.matchScore = matchScore;
  const linkedProjects = profile?.contributedProjects ?? [];
  const profileAchievements = profile?.achievements ?? [];
  const profileLinks = profile?.links ?? { github: "#", linkedin: "#", portfolio: "#" };

  if (isOwnProfileRoute && !isLoggedIn) {
    return (
      <div className="container py-10">
        <div className="ds-card p-7 bg-gradient-hero">
          <span className="ds-chip-primary">Profile</span>
          <h1 className="ds-page-title mt-3">Sign in to view your builder profile</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Your real profile, posts, followers, requests, and collaboration activity will appear here after login.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/login" className="h-11 px-5 rounded-xl bg-primary text-white font-semibold inline-flex items-center justify-center hover:bg-primary-hover">Sign in</Link>
            <Link to="/signup" className="h-11 px-5 rounded-xl bg-card border border-border font-semibold inline-flex items-center justify-center hover:bg-secondary">Create account</Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-20 flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-10">
        <div className="ds-card p-7 text-center">
          <h1 className="ds-page-title">Profile not found</h1>
          <p className="text-muted-foreground mt-2">The requested profile is unavailable.</p>
          <Link to="/discover-builders" className="mt-6 h-11 px-5 rounded-xl bg-primary text-white font-semibold inline-flex items-center justify-center hover:bg-primary-hover">Discover builders</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10 space-y-6">
      <div className="ds-card p-7 bg-gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 -z-0 opacity-30">
          <div className="absolute top-0 right-0 size-64 rounded-full bg-primary blur-3xl" />
          <div className="absolute right-6 top-6 w-48 h-48 pointer-events-none">
            <Suspense fallback={null}>
              <ProfileHero3D />
            </Suspense>
          </div>
        </div>
        <div className="relative flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="size-24 rounded-2xl bg-gradient-primary text-white text-3xl font-display font-bold flex items-center justify-center shadow-glow overflow-hidden">
            {profile?.avatar && /^(data:|https?:\/\/)/.test(profile.avatar) ? (
              <img src={profile.avatar} alt={profile.name || "Profile"} className="size-full object-cover" />
            ) : (
              (profile?.name || "GB").split(" ").map((s:any)=>s[0]).slice(0,2).join("")
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="ds-page-title">{profile?.name || profile?.username || "Unknown Builder"}</h1>
            <p className="text-muted-foreground">
              @{profile?.username || "unknown"} · {profile?.college ? profile.college : "Student"}
              {profile?.year ? ` · ${profile.year}` : ""}
            </p>
            {profile?.college && (
              <p className="text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" /> {profile.college}
                </span>
              </p>
            )}
            {profile?.bio && (
              <p className="text-sm text-muted-foreground mt-2 max-w-xl">
                {profile.bio}
              </p>
            )}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {(profile?.skills || []).map((s: any) => (
                <span key={s} className="ds-chip-primary">
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            {state.currentUser && profile?.id === state.currentUser.id && (
              <>
                <AvatarUpload userId={profile?.id || ""} />
                <Link to="/profile/edit" className="h-10 px-4 rounded-xl bg-card border border-border font-semibold text-sm hover:bg-secondary inline-flex items-center gap-2">
                  <Edit3 className="size-4" /> Edit Profile
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(profileStats).map(([k, v]) => (
          <button key={k} className="ds-card p-5 text-left hover:bg-secondary transition-colors">
            <p className="text-sm text-muted-foreground capitalize">{k.replace(/([A-Z])/g, " $1")}</p>
            <p className="text-2xl font-bold mt-1">{v as React.ReactNode}{k === "matchScore" && "%"}</p>
          </button>
        ))}
      </div>

      <div className="ds-card p-2 inline-flex flex-wrap gap-1">
        {profileTabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 h-9 rounded-lg text-sm font-medium transition-colors ${tab === t ? "bg-primary text-white" : "text-muted-foreground hover:bg-secondary"}`}>{t}</button>
        ))}
      </div>

      {tab === "Overview" && (
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <div className="ds-card p-6 min-h-[340px]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Contributions</h3>
                  <p className="text-sm text-muted-foreground mt-1">Monthly contribution activity with an expanded chart layout.</p>
                </div>
              </div>
              <div className="mt-6 w-full">
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={dynamicChartData} margin={{ top: 12, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="m" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }} />
                    <Bar dataKey="c" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="ds-card p-6 min-h-[440px]">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Activity Heatmap</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {(() => {
                      const totalDays = Object.keys(activityHistory).length;
                      return totalDays > 0
                        ? `${totalDays} active day${totalDays > 1 ? "s" : ""} in the last year.`
                        : "Stay active by posting and working on projects to build your streak.";
                    })()}
                  </p>
                </div>
              </div>
              <div className="mt-6 overflow-x-auto">
                <div className="min-w-[720px] p-4 rounded-xl border border-border bg-card dark:bg-[#0d1117] dark:border-[#30363d]">
                  <div className="flex gap-2 text-[10px] select-none font-mono">
                    {/* Left column: Day labels */}
                    <div className="grid grid-rows-7 gap-[3px] h-[88px] text-[#8b949e] pr-1 mt-[22px]">
                      <span className="leading-none flex items-center h-[10px]"></span>
                      <span className="leading-none flex items-center h-[10px] text-[#8b949e]">Mon</span>
                      <span className="leading-none flex items-center h-[10px]"></span>
                      <span className="leading-none flex items-center h-[10px] text-[#8b949e]">Wed</span>
                      <span className="leading-none flex items-center h-[10px]"></span>
                      <span className="leading-none flex items-center h-[10px] text-[#8b949e]">Fri</span>
                      <span className="leading-none flex items-center h-[10px]"></span>
                    </div>
                    
                    {/* Right column: Month Labels + Squares Grid */}
                    <div className="flex-1">
                      {/* Month Labels */}
                      <div className="grid gap-[3px] mb-1.5 h-4" style={{ gridTemplateColumns: 'repeat(53, 10px)' }}>
                        {(() => {
                          const monthLabels = getMonthLabels();
                          return Array.from({ length: 53 }).map((_, colIdx) => {
                            const month = monthLabels[colIdx] || "";
                            return (
                              <div key={colIdx} className="relative h-full">
                                {month && (
                                  <span className="absolute left-0 bottom-0 text-[10px] leading-none whitespace-nowrap text-[#8b949e]">
                                    {month}
                                  </span>
                                )}
                              </div>
                            );
                          });
                        })()}
                      </div>
                      
                      {/* Squares Grid */}
                      <TooltipProvider delayDuration={100}>
                        <div 
                          className="grid grid-flow-col gap-[3px]" 
                          style={{ 
                            gridTemplateColumns: 'repeat(53, 10px)', 
                            gridTemplateRows: 'repeat(7, 10px)' 
                          }}
                        >
                          {contributions.map((lvl, i) => {
                            const colors = [
                              "bg-[#ebedf0] dark:bg-[#161b22]",
                              "bg-[#9be9a8] dark:bg-[#0e4429]",
                              "bg-[#40c463] dark:bg-[#006d32]",
                              "bg-[#30a14e] dark:bg-[#26a641]",
                              "bg-[#216e39] dark:bg-[#39d353]",
                            ];
                            // Compute the date for this cell for the tooltip
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const todayDay = today.getDay();
                            const startDate = new Date(today);
                            startDate.setDate(startDate.getDate() - (52 * 7 + todayDay));
                            const cellDate = new Date(startDate);
                            cellDate.setDate(startDate.getDate() + i);
                            const dateStr = cellDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
                            const history = activityHistory;
                            const dateKey = cellDate.toISOString().slice(0, 10);
                            const count = history[dateKey] || 0;
                            const tooltipText = count > 0
                              ? `${count} contribution${count > 1 ? "s" : ""} on ${dateStr}`
                              : `No contributions on ${dateStr}`;
                            return (
                              <UITooltip key={i}>
                                <TooltipTrigger asChild>
                                  <div
                                    className={`w-[10px] h-[10px] rounded-[2px] ${colors[lvl]} transition-all hover:scale-125 duration-100 cursor-pointer`}
                                  />
                                </TooltipTrigger>
                                <TooltipContent side="top" sideOffset={8}>
                                  <p className="text-xs">{tooltipText}</p>
                                </TooltipContent>
                              </UITooltip>
                            );
                          })}
                        </div>
                      </TooltipProvider>
                    </div>
                  </div>
                  
                  {/* Footer */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mt-6 text-[11px] text-[#8b949e] select-none font-mono">
                    <span className="text-[#8b949e]">
                      Each square represents a day · darker = more activity
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span>Less</span>
                      <div className="w-[10px] h-[10px] rounded-[2px] bg-[#ebedf0] dark:bg-[#161b22]" />
                      <div className="w-[10px] h-[10px] rounded-[2px] bg-[#9be9a8] dark:bg-[#0e4429]" />
                      <div className="w-[10px] h-[10px] rounded-[2px] bg-[#40c463] dark:bg-[#006d32]" />
                      <div className="w-[10px] h-[10px] rounded-[2px] bg-[#30a14e] dark:bg-[#26a641]" />
                      <div className="w-[10px] h-[10px] rounded-[2px] bg-[#216e39] dark:bg-[#39d353]" />
                      <span>More</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="ds-card p-6">
              <h3 className="font-semibold text-lg">Profile Completion</h3>
              <div className="flex items-end gap-2 mt-3"><span className="text-3xl font-bold">{completion}%</span><span className="text-xs text-muted-foreground mb-1">3 steps left</span></div>
              <div className="h-2 bg-secondary rounded-full mt-3 overflow-hidden"><div className="h-full w-[78%] bg-gradient-primary rounded-full" /></div>
              <ul className="mt-4 space-y-2 text-sm">
                {["Add portfolio link", "Verify college email", "Add 2 more skills"].map((s) => (
                  <li key={s} className="flex items-center gap-2 text-muted-foreground"><div className="size-1.5 rounded-full bg-primary" /> {s}</li>
                ))}
              </ul>
            </div>
            <div className="ds-card p-6">
              <h3 className="font-semibold text-lg mb-3">Links</h3>
              <div className="space-y-2">
                <a href={profileLinks.github} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary"><Github className="size-4" /><span className="text-sm">GitHub</span></a>
                <a href={profileLinks.linkedin} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary"><Linkedin className="size-4" /><span className="text-sm">LinkedIn</span></a>
                <a href={profileLinks.portfolio} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary"><Globe className="size-4" /><span className="text-sm">Portfolio</span></a>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "Posts" && (
        <div className="space-y-4">
          <div className="ds-card p-6 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-lg">Posts by {profile?.name || "this builder"}</h3>
              <p className="text-sm text-muted-foreground">Project updates, collaboration requests, and build progress.</p>
            </div>
            <Link to="/feed" className="h-10 px-4 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover inline-flex items-center justify-center">Create Post</Link>
          </div>

          {profilePosts.length ? profilePosts.map((post) => (
            <PostCard key={post.id} post={post} />
          )) : (
            <div className="ds-card p-16 text-center">
              <h3 className="font-semibold text-lg">No posts yet</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">Share your first collaboration request to connect with builders.</p>
              <Link to="/feed" className="mt-6 h-11 px-5 rounded-xl bg-primary text-white font-semibold inline-flex items-center justify-center hover:bg-primary-hover">Create Post</Link>
            </div>
          )}
        </div>
      )}

      {tab === "Saved" && (
        <div className="space-y-8">
          {/* Saved Projects Section */}
          <div className="space-y-4">
            <div className="ds-card p-6">
              <h3 className="font-semibold text-lg">Saved Projects</h3>
              <p className="text-sm text-muted-foreground">Student projects you have bookmarked for quick access.</p>
            </div>

            {savedProjects.length ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {savedProjects.map((p) => (
                  <ProjectCard key={p.id} project={p} />
                ))}
              </div>
            ) : (
              <div className="ds-card p-12 flex flex-col items-center justify-center text-center border-dashed">
                <div className="size-16 rounded-full bg-secondary flex items-center justify-center mb-4 shadow-sm">
                  <FolderOpen className="size-8 text-muted-foreground" />
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">No saved projects yet</h4>
                <p className="text-sm text-muted-foreground max-w-sm mb-6">Browse projects and click "Save" on the details page to revisit them here.</p>
                <Link to="/find-projects" className="h-10 px-6 rounded-xl bg-primary text-white font-semibold inline-flex items-center justify-center hover:bg-primary-hover transition-all shadow-glow">Explore Projects</Link>
              </div>
            )}
          </div>

          {/* Saved Posts Section */}
          <div className="space-y-4">
            <div className="ds-card p-6">
              <h3 className="font-semibold text-lg">Saved Posts</h3>
              <p className="text-sm text-muted-foreground">Collaboration posts you have bookmarked for quick access.</p>
            </div>

            {savedPosts.length ? (
              savedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <div className="ds-card p-12 flex flex-col items-center justify-center text-center border-dashed">
                <div className="size-16 rounded-full bg-secondary flex items-center justify-center mb-4 shadow-sm">
                  <Bookmark className="size-8 text-muted-foreground" />
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">No saved posts</h4>
                <p className="text-sm text-muted-foreground max-w-sm mb-6">Browse the collaboration feed and save posts to revisit them.</p>
                <Link to="/feed" className="h-10 px-6 rounded-xl bg-primary text-white font-semibold inline-flex items-center justify-center hover:bg-primary-hover transition-all shadow-glow">Explore Feed</Link>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "Projects" && (
        <div className="ds-card p-6">
          <h3 className="font-semibold text-lg mb-4">Contributed Projects</h3>
          <div className="space-y-3">
            {linkedProjects.map((p: string) => (
              <div key={p} className="flex items-center justify-between p-4 rounded-xl bg-surface-alt border border-border">
                <div><p className="font-semibold">{p}</p><p className="text-xs text-muted-foreground">12 commits · 3 PRs merged</p></div>
                <span className="ds-chip-primary">Active</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "Working Projects" && (
        <div className="space-y-4">
          <div className="ds-card p-6 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold text-lg">Working Projects</h3>
              <p className="text-sm text-muted-foreground">Projects this builder is currently working on or leading.</p>
            </div>
            {isOwnProfileRoute && (
              <Link to="/my-projects" className="h-10 px-4 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover inline-flex items-center justify-center">Manage</Link>
            )}
          </div>
          {workingProjects.length ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {workingProjects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          ) : (
             <div className="ds-card p-12 flex flex-col items-center justify-center text-center border-dashed">
                <div className="size-16 rounded-full bg-secondary flex items-center justify-center mb-4 shadow-sm">
                  <Telescope className="size-8 text-muted-foreground" />
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">Not actively working on projects</h4>
                <p className="text-sm text-muted-foreground max-w-sm mb-6">Find a team to join or start your own project to see it here.</p>
                <Link to="/find-projects" className="h-10 px-6 rounded-xl bg-primary text-white font-semibold inline-flex items-center justify-center hover:bg-primary-hover transition-all shadow-glow">Find a Project</Link>
             </div>
          )}
        </div>
      )}

      {tab === "Achievements" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {profileAchievements.map((a: any) => (
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
            {profilePosts.length > 0 ? profilePosts.slice(0, 10).map((post: any) => (
              <li key={post.id} className="p-3 rounded-xl bg-surface-alt border border-border text-sm">
                Posted: <span className="font-semibold text-foreground">{post.title}</span> <span className="text-muted-foreground text-xs ml-2">{new Date(post.created_at || post.createdAt).toLocaleDateString()}</span>
              </li>
            )) : (
              <li className="p-3 rounded-xl bg-surface-alt border border-border text-sm text-muted-foreground">No recent activity</li>
            )}
          </ul>
        </div>
      )}

      {tab === "Network" && (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="ds-card p-6">
            <div className="flex items-center gap-2 text-primary mb-2"><Users className="size-4" /><h3 className="font-semibold text-lg">Followers</h3></div>
            <p className="text-3xl font-bold">{profileStats.followers}</p>
            <p className="text-sm text-muted-foreground mt-1">People following this builder.</p>
          </div>
          <div className="ds-card p-6">
            <div className="flex items-center gap-2 text-primary mb-2"><Send className="size-4" /><h3 className="font-semibold text-lg">Following</h3></div>
            <p className="text-3xl font-bold">{profileStats.following}</p>
            <p className="text-sm text-muted-foreground mt-1">Builders this user follows.</p>
          </div>
          <div className="ds-card p-6">
            <div className="flex items-center gap-2 text-primary mb-2"><Inbox className="size-4" /><h3 className="font-semibold text-lg">Pending Requests</h3></div>
            <p className="text-3xl font-bold">{profileStats.pendingRequests}</p>
            <p className="text-sm text-muted-foreground mt-1">Open collaboration requests waiting for a reply.</p>
          </div>
        </div>
      )}

      {tab === "Requests" && (
        <div className="ds-card p-6">
          <h3 className="font-semibold text-lg mb-3">Collaboration Requests</h3>
          <p className="text-sm text-muted-foreground">Open the Requests page to manage incoming and sent collaboration requests.</p>
          <Link to="/requests" className="mt-4 h-10 px-4 rounded-xl bg-primary text-white font-semibold text-sm inline-flex items-center justify-center hover:bg-primary-hover">Go to Requests</Link>
        </div>
      )}
    </div>
  );
}



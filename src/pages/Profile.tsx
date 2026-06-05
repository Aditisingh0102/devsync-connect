import { useState, lazy, Suspense, useMemo } from "react";
import { Edit3, Github, Globe, Linkedin, Mail, MapPin, Trophy, Inbox, Users, Send } from "lucide-react";
import AvatarUpload from "@/components/AvatarUpload";
const ProfileHero3D = lazy(() => import("@/components/ProfileHero3D"));
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { Link, useParams } from "react-router-dom";
import { useApp } from "@/lib/store";
import PostCard from "@/components/PostCard";

const tabs = ["Overview", "Posts", "Projects", "Activity", "Network", "Requests"];

const chartData = [
  { m: "Jan", c: 8 }, { m: "Feb", c: 14 }, { m: "Mar", c: 22 }, { m: "Apr", c: 18 },
  { m: "May", c: 28 }, { m: "Jun", c: 34 }, { m: "Jul", c: 26 }, { m: "Aug", c: 38 },
];

export default function Profile() {
  const [tab, setTab] = useState("Overview");
  const completion = 78;
  const { state } = useApp();
  const params = useParams();
  const profileId = params.id || state.currentUser?.id;
  const isOwnProfileRoute = !params.id;
  const user = (profileId && state.users[profileId]) || state.currentUser || null;
  const isLoggedIn = !!state.currentUser;
  const profile = (user ?? {}) as any;

  const profileTabs = useMemo(() => {
    if (state.currentUser && profileId === state.currentUser.id) {
      return ["Overview", "Posts", "Saved", "Projects", "Activity", "Network", "Requests"];
    }
    return ["Overview", "Posts", "Projects", "Activity", "Network", "Requests"];
  }, [state.currentUser, profileId]);

  const profilePosts = useMemo(() => Object.values(state.posts).filter((post) => post.authorId === profile?.id).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)), [state.posts, profile?.id]);

  const savedPosts = useMemo(() => {
    const savedIds = profile?.savedPosts || [];
    return Object.values(state.posts)
      .filter((post) => savedIds.includes(post.id))
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [state.posts, profile?.savedPosts]);

  const profileStats = {
    posts: profilePosts.length,
    followers: profile?.followers?.length ?? 0,
    following: profile?.following?.length ?? 0,
    pendingRequests: profile?.pendingRequests?.length ?? 0,
    matchScore: profile?.stats?.matchScore ?? 92,
  };
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
            <a href="/login" className="h-11 px-5 rounded-xl bg-primary text-white font-semibold inline-flex items-center justify-center hover:bg-primary-hover">Sign in</a>
            <a href="/signup" className="h-11 px-5 rounded-xl bg-card border border-border font-semibold inline-flex items-center justify-center hover:bg-secondary">Create account</a>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container py-10">
        <div className="ds-card p-7 text-center">
          <h1 className="ds-page-title">Profile not found</h1>
          <p className="text-muted-foreground mt-2">The requested profile is unavailable.</p>
          <a href="/discover-builders" className="mt-6 h-11 px-5 rounded-xl bg-primary text-white font-semibold inline-flex items-center justify-center hover:bg-primary-hover">Discover builders</a>
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
          <div className="size-24 rounded-2xl bg-gradient-primary text-white text-3xl font-display font-bold flex items-center justify-center shadow-glow">{(profile?.name || "GB").split(" ").map((s:any)=>s[0]).slice(0,2).join("")}</div>
          <div className="flex-1 min-w-0">
            <h1 className="ds-page-title">{profile?.name || "Guest Builder"}</h1>
            <p className="text-muted-foreground">{profile?.handle || "@guest"} · {profile?.role || "Student"}</p>
            <p className="text-sm text-muted-foreground mt-1 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" /> {profile?.college || "—"}</span>
              <span className="inline-flex items-center gap-1"><Mail className="size-3.5" /> {profile?.links?.github ? profile.links.github.replace(/^https?:\/\//, "") : "—"}</span>
            </p>
            <div className="flex flex-wrap gap-1.5 mt-3">{(profile?.skills || []).map((s:any) => <span key={s} className="ds-chip-primary">{s}</span>)}</div>
          </div>
          <div className="flex gap-2">
            <AvatarUpload userId={profile?.id || ""} />
            <button className="h-10 px-4 rounded-xl bg-card border border-border font-semibold text-sm hover:bg-secondary inline-flex items-center gap-2"><Edit3 className="size-4" /> Edit</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(profileStats).map(([k, v]) => (
          <button key={k} className="ds-card p-5 text-left hover:bg-secondary transition-colors">
            <p className="text-sm text-muted-foreground capitalize">{k.replace(/([A-Z])/g, " $1")}</p>
            <p className="text-2xl font-bold mt-1">{v}{k === "matchScore" && "%"}</p>
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
            <div key={post.id} className="ds-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-semibold">{post.title}</h4>
                    <span className="ds-chip-primary text-[10px] py-1">{post.type}</span>
                    {post.projectType && <span className="ds-chip text-[10px] py-1">{post.projectType}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{post.domain || "General"} · {new Date(post.createdAt).toLocaleString()}</p>
                </div>
                <span className={`ds-chip ${post.status === "open" ? "bg-success-bg text-success" : "bg-secondary text-muted-foreground"}`}>{post.status || "open"}</span>
              </div>
              <p className="text-sm text-foreground mt-3">{post.body}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(post.tech || []).map((tech) => <span key={tech} className="ds-chip text-[10px] py-1">{tech}</span>)}
                {post.lookingFor?.length ? <span className="ds-chip-primary text-[10px] py-1">Looking for {post.lookingFor.join(", ")}</span> : null}
              </div>
              {post.imageUrl && <img src={post.imageUrl} alt={post.title} className="mt-3 rounded-xl border border-border max-h-72 w-full object-cover" />}
            </div>
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
            <div className="ds-card p-16 text-center">
              <h3 className="font-semibold text-lg">No saved posts</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">Browse the collaboration feed and click the "Save" button on posts you'd like to revisit.</p>
              <Link to="/feed" className="mt-6 h-11 px-5 rounded-xl bg-primary text-white font-semibold inline-flex items-center justify-center hover:bg-primary-hover">Browse Feed</Link>
            </div>
          )}
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
            {["Joined DevSync Team Match AI", "Completed Sprint 3", "Earned 'Team Lead' badge", "Pushed 12 commits to Campus Connect"].map((t, i) => (
              <li key={i} className="p-3 rounded-xl bg-surface-alt border border-border text-sm">{t}</li>
            ))}
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

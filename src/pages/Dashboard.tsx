import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useApp } from "@/lib/store";
import { ArrowRight, Bell, Compass, Sparkles, Users2, Zap } from "lucide-react";
import PostCard from "@/components/PostCard";

export default function Dashboard() {
  const { state } = useApp();
  const me = state.currentUser;

  const recentPosts = useMemo(
    () => Object.values(state.posts).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 4),
    [state.posts]
  );
  const notifications = useMemo(
    () => Object.values(state.notifications).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 4),
    [state.notifications]
  );

  if (!me) {
    return (
      <div className="container py-20 max-w-2xl">
        <div className="ds-card p-12 text-center bg-gradient-hero">
          <div className="size-14 rounded-2xl bg-gradient-primary text-white flex items-center justify-center mx-auto mb-4 shadow-glow"><Sparkles className="size-6" /></div>
          <h1 className="ds-page-title">Set up your DevSync profile</h1>
          <p className="text-sm text-muted-foreground mt-2">Complete onboarding to see a personalized dashboard with matched projects, builders, and posts.</p>
          <Link to="/onboarding/profile-setup" className="mt-5 inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover">Get started <ArrowRight className="size-4" /></Link>
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Followers", value: (me.followers || []).length, icon: Users2 },
    { label: "Following", value: (me.following || []).length, icon: Users2 },
    { label: "Pending", value: (me.pendingRequests || []).length, icon: Bell },
    { label: "Posts", value: Object.values(state.posts).filter((p) => p.authorId === me.id).length, icon: Compass },
  ];

  return (
    <div className="container py-10 space-y-6">
      <div className="ds-card p-7 bg-gradient-hero">
        <span className="ds-chip-primary"><Sparkles className="size-3.5" /> Welcome back</span>
        <h1 className="ds-page-title mt-2">Hi {me.name?.split(" ")[0]}, ready to build?</h1>
        <p className="text-sm text-muted-foreground mt-1">Your personalized collaboration feed, requests, and recommended builders — all in one place.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="ds-card p-5">
            <div className="size-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center mb-3"><s.icon className="size-5" /></div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Recent collaboration posts</h3>
            <Link to="/feed" className="text-sm font-semibold text-primary inline-flex items-center gap-1">Open feed <ArrowRight className="size-4" /></Link>
          </div>
          {recentPosts.length === 0 ? (
            <div className="ds-card p-10 text-center">
              <p className="font-semibold">No posts yet</p>
              <p className="text-sm text-muted-foreground mt-1">Share your first collaboration request to connect with builders.</p>
              <Link to="/feed" className="mt-4 inline-flex h-10 px-4 items-center gap-2 rounded-xl bg-primary text-white font-semibold"><Zap className="size-4" /> Create Post</Link>
            </div>
          ) : recentPosts.map((p) => <PostCard key={p.id} post={p} />)}
        </div>

        <div className="space-y-5">
          <div className="ds-card p-6">
            <h3 className="font-semibold text-lg mb-3">Notifications</h3>
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground">You're all caught up.</p>
            ) : (
              <ul className="space-y-3">
                {notifications.map((n) => (
                  <li key={n.id} className="text-sm">
                    <p className="font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.body}</p>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/notifications" className="mt-4 inline-flex text-sm font-semibold text-primary items-center gap-1">View all <ArrowRight className="size-4" /></Link>
          </div>

          <div className="ds-card p-6">
            <h3 className="font-semibold text-lg mb-3">Suggested builders</h3>
            <ul className="space-y-3">
              {Object.values(state.users).filter((u) => u.id !== me.id).slice(0, 3).map((u) => (
                <li key={u.id} className="flex items-center gap-3">
                  <div className="size-9 rounded-full bg-gradient-primary text-white text-xs font-semibold flex items-center justify-center">{u.name?.split(" ").map((s) => s[0]).slice(0,2).join("")}</div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/profile/${u.id}`} className="text-sm font-medium hover:text-primary truncate block">{u.name}</Link>
                    <div className="text-xs text-muted-foreground truncate">@{u.username}</div>
                  </div>
                </li>
              ))}
            </ul>
            <Link to="/discover-builders" className="mt-4 inline-flex text-sm font-semibold text-primary items-center gap-1">Discover all <ArrowRight className="size-4" /></Link>
          </div>
        </div>
      </div>
    </div>
  );
}

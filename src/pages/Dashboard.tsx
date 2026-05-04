import type { ComponentType } from "react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Bell, FolderPlus, Users, UserPlus, ClipboardList } from "lucide-react";
import { useApp } from "@/lib/store";

export default function Dashboard() {
  const { state } = useApp();
  const me = state.currentUser;
  const myPosts = useMemo(() => (me ? Object.values(state.posts).filter((post) => post.authorId === me.id).slice(0, 3) : []), [state.posts, me]);
  const incomingRequests = useMemo(() => (me ? Object.values(state.requests).filter((request) => request.toId === me.id && request.status === "pending").slice(0, 3) : []), [state.requests, me]);
  const recentFollowers = useMemo(() => (me ? (me.followers || []).slice(-3).map((id) => state.users[id]).filter(Boolean) : []), [me, state.users]);

  return (
    <div className="container py-10 space-y-6">
      <div className="max-w-6xl mx-auto">
        {me ? (
          <div className="space-y-6">
            <div className="ds-card p-7 bg-gradient-hero flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <span className="ds-chip-primary">Dashboard</span>
                <h1 className="ds-page-title mt-2">Welcome back, {me.name}!</h1>
                <p className="text-muted-foreground mt-1 max-w-2xl">Your projects, requests, followers, and recent activity are connected here.</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Link to="/feed" className="h-11 px-5 rounded-xl bg-primary text-white font-semibold inline-flex items-center justify-center gap-2 hover:bg-primary-hover">
                  <FolderPlus className="size-4" /> Create Post
                </Link>
                <Link to="/discover-builders" className="h-11 px-5 rounded-xl bg-card border border-border font-semibold inline-flex items-center justify-center gap-2 hover:bg-secondary">
                  <Users className="size-4" /> Discover Builders
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Stat title="Posts" value={Object.values(state.posts).filter((post) => post.authorId === me.id).length} icon={ClipboardList} />
              <Stat title="Followers" value={me.followers?.length || 0} icon={Users} />
              <Stat title="Following" value={me.following?.length || 0} icon={UserPlus} />
              <Stat title="Pending Requests" value={incomingRequests.length} icon={Bell} />
            </div>

            <div className="grid lg:grid-cols-3 gap-5">
              <div className="ds-card p-6 lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Recent collaboration posts</h3>
                  <Link to="/feed" className="text-sm font-semibold text-primary inline-flex items-center gap-1">
                    Open feed <ArrowRight className="size-4" />
                  </Link>
                </div>
                <div className="space-y-3">
                  {myPosts.length ? myPosts.map((post) => (
                    <div key={post.id} className="p-4 rounded-xl bg-surface-alt border border-border">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-sm">{post.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{post.domain || "General"} · {post.projectType || post.type}</p>
                        </div>
                        <span className="ds-chip-primary text-[10px] py-1">{post.status || "open"}</span>
                      </div>
                    </div>
                  )) : <EmptyCard title="No posts yet" body="Create your first collaboration request to start building visibility." actionLabel="Create Post" href="/feed" />}
                </div>
              </div>

              <div className="space-y-5">
                <div className="ds-card p-6">
                  <h3 className="font-semibold text-lg mb-3">Quick profile summary</h3>
                  <div className="text-sm text-muted-foreground">{me.college || "College not added"}</div>
                  <div className="mt-3 flex flex-wrap gap-1.5">{(me.skills || []).slice(0, 4).map((s) => <span key={s} className="ds-chip-primary">{s}</span>)}</div>
                </div>
                <div className="ds-card p-6">
                  <h3 className="font-semibold text-lg mb-3">Incoming requests</h3>
                  <div className="space-y-2">
                    {incomingRequests.length ? incomingRequests.map((request) => (
                      <div key={request.id} className="p-3 rounded-xl bg-surface-alt border border-border text-sm">
                        {state.users[request.fromId]?.name || "A builder"} wants to collaborate.
                      </div>
                    )) : <p className="text-sm text-muted-foreground">No pending requests right now.</p>}
                  </div>
                </div>
                <div className="ds-card p-6">
                  <h3 className="font-semibold text-lg mb-3">Recent followers</h3>
                  <div className="space-y-2">
                    {recentFollowers.length ? recentFollowers.map((user: any) => <div key={user.id} className="text-sm p-3 rounded-xl bg-surface-alt border border-border">{user?.name}</div>) : <p className="text-sm text-muted-foreground">No recent followers yet.</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 ds-card">
            <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
            <p className="text-lg text-muted-foreground">Please log in to view your dashboard.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ title, value, icon: Icon }: { title: string; value: number; icon: ComponentType<{ className?: string }> }) {
  return (
    <div className="ds-card p-5">
      <div className="size-10 rounded-xl bg-primary-soft text-primary flex items-center justify-center mb-3"><Icon className="size-5" /></div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-muted-foreground">{title}</div>
    </div>
  );
}

function EmptyCard({ title, body, actionLabel, href }: { title: string; body: string; actionLabel: string; href: string }) {
  return (
    <div className="p-4 rounded-xl bg-surface-alt border border-border text-center">
      <p className="font-semibold text-sm">{title}</p>
      <p className="text-xs text-muted-foreground mt-1">{body}</p>
      <Link to={href} className="mt-3 h-9 px-3 rounded-xl bg-primary text-white text-sm font-semibold inline-flex items-center justify-center">{actionLabel}</Link>
    </div>
  );
}

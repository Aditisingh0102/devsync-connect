import { Link, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import FollowListModal from "@/components/FollowListModal";
import { ArrowRight, Bell, FolderPlus, Users, UserPlus, ClipboardList, Loader2 } from "lucide-react";
import { useApp } from "@/lib/store";
import { api, getToken } from "@/lib/api";

export default function Dashboard() {
  const { state } = useApp();
  const location = useLocation();
  const isNewSignup = location.state?.isNewSignup;
  const me = state.currentUser;

  const [dashData, setDashData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [acceptedRequests, setAcceptedRequests] = useState<number[]>([]);
  const [rejectedRequests, setRejectedRequests] = useState<number[]>([]);
  const [followedBack, setFollowedBack] = useState<number[]>([]);
  const [modalConfig, setModalConfig] = useState<{isOpen: boolean, type: "followers" | "following"}>({isOpen: false, type: "followers"});

  const handleAcceptRequest = async (reqId: number, fromId: number) => {
    try {
      await api.updateRequest(reqId, { status: "accepted" });
      setAcceptedRequests(prev => [...prev, reqId]);
      setFollowedBack(prev => [...prev, fromId]);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleRejectRequest = async (reqId: number) => {
    try {
      await api.updateRequest(reqId, { status: "rejected" });
      setRejectedRequests(prev => [...prev, reqId]);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleFollowBack = async (userId: number) => {
    if (!userId) return;
    try {
      await api.followUser(userId);
      setFollowedBack(prev => [...prev, userId]);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!getToken()) { setLoading(false); return; }
    api.getDashboard()
      .then(data => setDashData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!me) {
    return (
      <div className="container py-20 max-w-2xl">
        <div className="ds-card p-12 text-center bg-gradient-hero">
          <h1 className="ds-page-title">Set up your DevSync profile</h1>
          <p className="text-sm text-muted-foreground mt-2">Complete onboarding to see a personalized dashboard with matched projects, builders, and posts.</p>
          <Link to="/onboarding/profile-setup" className="mt-5 inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-hover">Get started <ArrowRight className="size-4" /></Link>
        </div>
      </div>
    );
  }

  const postCount = dashData?.posts_count ?? Object.values(state.posts).filter((post: any) => post.authorId === me.id).length;
  const followerCount = dashData?.followers_count ?? me.followers?.length ?? 0;
  const followingCount = dashData?.following_count ?? me.following?.length ?? 0;
  const pendingRequestCount = dashData?.pending_requests_count ?? 0;
  const recentPosts = dashData?.recent_posts ?? [];
  const recentRequests = dashData?.incoming_requests ?? [];

  return (
    <div className="container py-10 space-y-6">
      <div className="space-y-6">
        <div className="ds-card p-7 bg-gradient-hero flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="ds-chip-primary">Dashboard</span>
            <h1 className="ds-page-title mt-2">
              {isNewSignup ? `Welcome, ${me.name || me.username || 'Builder'}!` : `Welcome back, ${me.name || me.username || 'Builder'}!`}
            </h1>
            <p className="text-muted-foreground mt-1 max-w-2xl">Your projects, requests, followers, and recent activity are connected here.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Link to="/feed" className="h-11 px-5 rounded-xl bg-primary text-white font-semibold inline-flex items-center justify-center gap-2 hover:bg-primary-hover"><FolderPlus className="size-4" /> Create Post</Link>
            <Link to="/discover-builders" className="h-11 px-5 rounded-xl bg-card border border-border font-semibold inline-flex items-center justify-center gap-2 hover:bg-secondary"><Users className="size-4" /> Discover Builders</Link>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Stat title="Posts" value={postCount} icon={ClipboardList} />
              <Stat title="Followers" value={followerCount} icon={Users} />
              <Stat title="Following" value={followingCount} icon={UserPlus} />
              <Stat title="Pending Requests" value={pendingRequestCount} icon={Bell} />
            </div>

            <div className="grid lg:grid-cols-3 gap-5">
              <div className="ds-card p-6 lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">Recent collaboration posts</h3>
                  <Link to="/feed" className="text-sm font-semibold text-primary inline-flex items-center gap-1">Open feed <ArrowRight className="size-4" /></Link>
                </div>
                <div className="space-y-3">
                  {recentPosts.length > 0 ? recentPosts.map((post: any) => (
                    <div key={post.id} className="p-4 rounded-xl bg-surface-alt border border-border">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-sm">{post.title || post.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{post.domain || post.project_type || "General"}</p>
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
                  <div className="mt-3 flex flex-wrap gap-1.5">{(me.skills || []).slice(0, 4).map((s: string) => <span key={s} className="ds-chip-primary">{s}</span>)}</div>
                </div>
                <div className="ds-card p-6">
                  <h3 className="font-semibold text-lg mb-3">Incoming requests</h3>
                  <div className="space-y-2">
                    {recentRequests.length > 0 ? recentRequests.map((req: any) => {
                      if (rejectedRequests.includes(req.id)) return null;
                      const isAccepted = acceptedRequests.includes(req.id);
                      const isFollowedBack = followedBack.includes(req.from_id);
                      
                      const displayName = req.from_name ? `${req.from_name} (@${req.from_username})` : (req.from_username ? `@${req.from_username}` : "A builder");
                      
                      return (
                        <div key={req.id} className="p-4 rounded-xl bg-surface-alt border border-border flex items-center justify-between">
                          <div className="text-sm">
                            <span className="font-semibold">{displayName}</span> {req.message || "wants to connect."}
                          </div>
                          <div className="flex gap-2">
                            {isAccepted ? (
                              isFollowedBack ? (
                                <button disabled className="h-8 px-3 rounded-lg bg-secondary text-xs font-medium opacity-70">Following</button>
                              ) : (
                                <button onClick={() => handleFollowBack(req.from_id)} className="h-8 px-3 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-hover">Follow Back</button>
                              )
                            ) : (
                              <>
                                <button onClick={() => handleAcceptRequest(req.id, req.from_id)} className="h-8 px-3 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-hover">Accept</button>
                                <button onClick={() => handleRejectRequest(req.id)} className="h-8 px-3 rounded-lg bg-secondary text-foreground text-xs font-medium hover:bg-secondary/80">Reject</button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    }) : <p className="text-sm text-muted-foreground">No pending requests right now.</p>}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <FollowListModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        type={modalConfig.type}
        username={me?.username}
        isOwnProfile={true}
      />
    </div>
  );
}

function Stat({ title, value, icon: Icon }: { title: string; value: number; icon: React.ComponentType<{ className?: string }> }) {
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



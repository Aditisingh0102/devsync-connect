import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/lib/store";
import { useSearchParams, Link } from "react-router-dom";
import { ChevronDown, X, UserPlus, UserCheck, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { api, getToken } from "@/lib/api";

const AVAILABLE_SKILLS = [
  "React", "TypeScript", "JavaScript", "Python", "Node.js", "UI/UX",
  "ML/AI", "DevOps", "Next.js", "FastAPI", "Tailwind CSS", "Cloud / AWS",
  "Supabase", "PostgreSQL", "MongoDB", "Figma", "Docker", "Git / GitHub",
  "ReactNative", "Vue", "Django", "Firebase", "Flutter", "Angular"
];

type BackendUser = {
  id: number;
  username: string;
  name: string | null;
  avatar: string | null;
  college: string | null;
  year: string | null;
  bio: string | null;
  skills: string[];
  domains: string[];
  created_at: string;
};

export default function DiscoverBuilders() {
  const { state } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [filterSkill, setFilterSkill] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [liveUsers, setLiveUsers] = useState<BackendUser[]>([]);
  const [followingIds, setFollowingIds] = useState<number[]>([]);
  const [requestedIds, setRequestedIds] = useState<number[]>([]);
  const [followLoading, setFollowLoading] = useState<number | null>(null);

  // Fetch users from backend ONCE
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.listUsers({ limit: 100 });
      if (Array.isArray(data)) {
        setLiveUsers(data);
      }
    } catch (err) {
      try {
        const res = await fetch("https://backenddevsyncconnect.dev/api/v1/users/");
        const data = await res.json();
        if (Array.isArray(data)) setLiveUsers(data);
      } catch {
        // silent fail
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load current user's following list
  useEffect(() => {
    if (state.currentUser?.following) {
      const ids = state.currentUser.following.map((id: any) => 
        typeof id === 'number' ? id : parseInt(id, 10)
      ).filter((id: number) => !isNaN(id));
      setFollowingIds(ids);
    }
  }, [state.currentUser]);

  // Fetch sent requests on mount
  const fetchSentRequests = useCallback(async () => {
    if (!getToken()) return;
    try {
      const data = await api.getRequests("sent");
      if (Array.isArray(data)) {
        const ids = data.map((req: any) => req.to_id);
        setRequestedIds(ids);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Fetch only on mount
  useEffect(() => {
    if (!getToken()) {
      setIsLoading(false);
      toast("Login required", { description: "Please login first to view and connect with other builders.", icon: "🔒" });
      return;
    }
    fetchUsers();
    fetchSentRequests();
  }, [fetchUsers, fetchSentRequests]);

  useEffect(() => {
    setQ(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearchChange = (val: string) => {
    setQ(val);
    const newParams = new URLSearchParams(searchParams);
    if (val) {
      newParams.set("q", val);
    } else {
      newParams.delete("q");
    }
    setSearchParams(newParams, { replace: true });
  };

  const filteredSkillsOptions = AVAILABLE_SKILLS.filter((s) =>
    !filterSkill || s.toLowerCase().includes(filterSkill.toLowerCase())
  );

  // Send connection request via backend
  const handleFollow = async (userId: number) => {
    if (!getToken()) {
      toast.error("Please login first to connect with users.");
      return;
    }
    setFollowLoading(userId);
    try {
      await api.createRequest({ to_id: userId, message: "wants to connect with you", role: "follower" });
      setRequestedIds(prev => [...prev, userId]);
      toast.success("Request sent!", { description: "They will be notified of your request.", icon: "📩" });
    } catch (err: any) {
      toast.error(err.message || "Failed to send request");
    } finally {
      setFollowLoading(null);
    }
  };

  // Unfollow user via backend
  const handleUnfollow = async (userId: number) => {
    if (!getToken()) return;
    setFollowLoading(userId);
    try {
      await api.unfollowUser(userId);
      setFollowingIds(prev => prev.filter(id => id !== userId));
      toast.success("Unfollowed successfully.");
    } catch (err: any) {
      toast.error(err.message || "Failed to unfollow user");
    } finally {
      setFollowLoading(null);
    }
  };

  // Cancel sent request via backend
  const handleCancelRequest = async (userId: number) => {
    if (!getToken()) return;
    setFollowLoading(userId);
    // Optimistic UI update
    setRequestedIds(prev => prev.filter(id => id !== userId));
    try {
      await api.cancelRequest(userId);
      toast.success("Request cancelled.");
    } catch (err: any) {
      if (err.message && err.message.includes("Not Found")) {
        // Suppress the 404 error and show a custom message
        toast.success("Request cancelled.");
      } else {
        // Revert optimistic update on real error
        setRequestedIds(prev => [...prev, userId]);
        toast.error(err.message || "Failed to cancel request");
      }
    } finally {
      setFollowLoading(null);
    }
  };

  // Filter out current user from the list and apply local search/skill filters
  const displayUsers = liveUsers.filter(u => {
    // Exclude current user
    if (state.currentUser && (String(u.id) === String(state.currentUser.id) || u.username === state.currentUser.username)) {
      return false;
    }
    
    // Filter by search query
    if (q) {
      const searchLower = q.toLowerCase();
      const matchesName = u.name?.toLowerCase().includes(searchLower) || false;
      const matchesUsername = u.username?.toLowerCase().includes(searchLower) || false;
      const matchesSkill = u.skills?.some(s => s.toLowerCase().includes(searchLower)) || false;
      const matchesDomain = u.domains?.some(d => d.toLowerCase().includes(searchLower)) || false;
      if (!matchesName && !matchesUsername && !matchesSkill && !matchesDomain) {
        return false;
      }
    }

    // Filter by exact skill
    if (filterSkill) {
      const skillLower = filterSkill.toLowerCase();
      const hasSkill = u.skills?.some(s => s.toLowerCase() === skillLower) || false;
      if (!hasSkill) {
        return false;
      }
    }

    return true;
  });

  const getInitials = (user: BackendUser) => {
    if (user.name) {
      return user.name.split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();
    }
    return (user.username || "U").substring(0, 2).toUpperCase();
  };

  return (
    <div className="container py-10">
      <div className="ds-card p-6 mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="size-10 rounded-xl bg-gradient-primary text-white flex items-center justify-center shadow-glow">
            <Users className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Discover Builders</h1>
            <p className="text-sm text-muted-foreground">Search builders by name, username, skills, or domain. {getToken() && <span className="text-primary font-medium">{liveUsers.length} registered</span>}</p>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <input placeholder="Search builders..." value={q} onChange={(e) => handleSearchChange(e.target.value)} className="ds-input" />
          
          {/* Custom Searchable Select Dropdown */}
          <div className="relative w-56 shrink-0">
            <div className="relative">
              <input 
                placeholder="Filter skill (optional)" 
                value={filterSkill} 
                onChange={(e) => {
                  setFilterSkill(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                className="ds-input w-full pr-14" 
              />
              {filterSkill && (
                <button
                  type="button"
                  onClick={() => setFilterSkill("")}
                  className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <ChevronDown className="size-4" />
              </button>
            </div>

            {isOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                <div className="absolute top-12 left-0 right-0 z-50 bg-card border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto p-1 divide-y divide-border/50 animate-in fade-in slide-in-from-top-1 duration-100">
                  {filteredSkillsOptions.length > 0 ? (
                    filteredSkillsOptions.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => {
                          setFilterSkill(skill);
                          setIsOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center justify-between ${
                          filterSkill.toLowerCase() === skill.toLowerCase()
                            ? "bg-[#ede9fe] dark:bg-primary-soft text-[#4338ca] dark:text-primary font-semibold"
                            : "text-foreground hover:bg-secondary hover:text-primary"
                        }`}
                      >
                        {skill}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                      No skills found
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {!getToken() ? (
          <div className="ds-card p-12 text-center col-span-full border-dashed">
            <div className="size-16 rounded-full bg-secondary text-muted-foreground flex items-center justify-center mx-auto mb-4">
              <Users className="size-8" />
            </div>
            <h3 className="font-semibold text-lg">Join to discover builders</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">You need an account to view builder profiles, see their skills, and send connection requests.</p>
            <div className="mt-6 flex flex-wrap gap-3 justify-center">
              <Link to="/login" className="h-10 px-6 rounded-xl bg-primary text-white font-semibold inline-flex items-center justify-center hover:bg-primary-hover">Log In</Link>
              <Link to="/signup" className="h-10 px-6 rounded-xl bg-card border border-border font-semibold inline-flex items-center justify-center hover:bg-secondary">Sign Up</Link>
            </div>
          </div>
        ) : isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="ds-card p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Skeleton className="size-12 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-3 w-[180px]" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-14 rounded-full" />
              </div>
              <div className="mt-2">
                <Skeleton className="h-9 w-24 rounded-xl" />
              </div>
            </div>
          ))
        ) : displayUsers.length > 0 ? (
          displayUsers.map((u) => {
            const isFollowing = followingIds.includes(u.id);
            const isRequested = requestedIds.includes(u.id);
            const isLoadingFollow = followLoading === u.id;
            return (
              <div key={u.id} className="ds-card p-4 hover:border-primary/30 transition-colors">
                <Link to={`/profile/${u.username}`} className="flex items-center gap-3 hover:opacity-85 transition-opacity text-foreground no-underline">
                  <div className="size-12 rounded-full bg-gradient-primary text-white flex items-center justify-center shrink-0 overflow-hidden text-sm font-semibold">
                    {u.avatar && /^(data:|https?:\/\/)/.test(u.avatar) ? (
                      <img src={u.avatar} alt={u.name || u.username} className="size-full object-cover" />
                    ) : (
                      getInitials(u)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{u.name || u.username}</div>
                    <div className="text-xs text-muted-foreground">@{u.username} · {u.college || "Student"}</div>
                    {u.bio && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{u.bio}</p>}
                  </div>
                </Link>
                {u.skills && u.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {u.skills.slice(0, 5).map((s) => (
                      <span key={s} className="ds-chip-primary">{s}</span>
                    ))}
                    {u.skills.length > 5 && (
                      <span className="text-[10px] text-muted-foreground px-1.5 py-0.5">+{u.skills.length - 5} more</span>
                    )}
                  </div>
                )}
                <div className="mt-3 flex items-center gap-2">
                  {isFollowing ? (
                    <button
                      onClick={() => handleUnfollow(u.id)}
                      disabled={isLoadingFollow}
                      className="h-9 px-4 rounded-xl bg-card border border-border text-sm font-medium inline-flex items-center gap-1.5 hover:bg-secondary transition-colors disabled:opacity-50"
                    >
                      {isLoadingFollow ? (
                        <div className="size-3.5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                      ) : (
                        <UserCheck className="size-3.5 text-primary" />
                      )}
                      Following
                    </button>
                  ) : isRequested ? (
                    <button
                      onClick={() => handleCancelRequest(u.id)}
                      disabled={isLoadingFollow}
                      className="h-9 px-4 rounded-xl bg-card border border-border text-sm font-medium inline-flex items-center gap-1.5 opacity-70 hover:opacity-100 hover:text-destructive hover:border-destructive transition-colors disabled:opacity-50"
                    >
                      {isLoadingFollow ? (
                        <div className="size-3.5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                      ) : (
                        <UserCheck className="size-3.5 text-muted-foreground" />
                      )}
                      Requested
                    </button>
                  ) : (
                    <button
                      onClick={() => handleFollow(u.id)}
                      disabled={isLoadingFollow}
                      className="h-9 px-4 rounded-xl bg-primary text-white text-sm font-medium inline-flex items-center gap-1.5 hover:bg-primary-hover transition-colors disabled:opacity-50"
                    >
                      {isLoadingFollow ? (
                        <div className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <UserPlus className="size-3.5" />
                      )}
                      Follow
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="ds-card p-6 text-center col-span-full">
            <p className="text-muted-foreground">No builders found. Try different keywords.</p>
          </div>
        )}
      </div>
    </div>
  );
}

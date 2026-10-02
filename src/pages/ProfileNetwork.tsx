import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useApp } from "@/lib/store";
import { api } from "@/lib/api";
import { Loader2, ArrowLeft, Users, UserMinus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ProfileNetwork() {
  const { state } = useApp();
  const me = state.currentUser;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "following" ? "following" : "followers";
  const [tab, setTab] = useState<"followers" | "following">(initialTab);
  
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    if (me?.username) {
      setLoading(true);
      const fetchPromise = tab === "followers" ? api.getFollowers(me.username) : api.getFollowing(me.username);
      
      fetchPromise
        .then((data) => {
          if (Array.isArray(data)) setUsers(data);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [tab, me]);

  const handleAction = async (userId: number, username: string) => {
    if (!me) return;
    try {
      setProcessingId(userId);
      if (tab === "followers") {
        await api.removeFollower(userId);
        setUsers(prev => prev.filter(u => u.id !== userId));
      } else {
        await api.unfollowUser(username);
        setUsers(prev => prev.filter(u => u.id !== userId));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  if (!me) {
    return (
      <div className="container py-20 flex flex-col items-center justify-center text-center">
        <Users className="size-10 text-muted-foreground opacity-50 mb-4" />
        <h2 className="text-xl font-semibold">Please log in</h2>
        <p className="text-muted-foreground mt-2">You need to be logged in to view your network.</p>
        <button onClick={() => navigate("/login")} className="mt-6 px-6 py-2 bg-primary text-white rounded-xl">Go to Login</button>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <button onClick={() => navigate("/profile")} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="size-4" /> Back to Profile
      </button>

      <div className="ds-card p-6 mb-6 bg-gradient-hero">
        <h1 className="ds-page-title mb-2">My Network</h1>
        <p className="text-muted-foreground">Manage the people you follow and those who follow you.</p>
        
        <div className="flex bg-secondary/50 p-1 rounded-xl mt-6 w-full max-w-sm">
          <button 
            onClick={() => setTab("followers")} 
            className={`flex-1 h-10 rounded-lg text-sm font-semibold transition-all ${tab === "followers" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Followers
          </button>
          <button 
            onClick={() => setTab("following")} 
            className={`flex-1 h-10 rounded-lg text-sm font-semibold transition-all ${tab === "following" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            Following
          </button>
        </div>
      </div>

      <div className="ds-card p-2 md:p-6 min-h-[400px]">
        {loading ? (
          <div className="h-60 flex items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : users.length === 0 ? (
          <div className="h-60 flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
            <Users className="size-12 opacity-20 mb-4" />
            <p className="font-medium text-foreground">No {tab} found</p>
            <p className="text-sm mt-1">When someone {tab === "followers" ? "follows you" : "is followed by you"}, they'll show up here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {users.map(user => (
              <div key={user.id} className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:bg-secondary/30 transition-colors">
                <div 
                  className="flex items-center gap-4 overflow-hidden cursor-pointer flex-1" 
                  onClick={() => navigate(`/profile/${user.id}`)}
                >
                  <Avatar className="size-12 shrink-0 border border-border/50">
                    {user.avatar ? <img src={user.avatar} alt={user.name} /> : <AvatarFallback>{user.name?.slice(0, 2) || "U"}</AvatarFallback>}
                  </Avatar>
                  <div className="overflow-hidden">
                    <p className="font-semibold text-sm truncate hover:underline">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">@{user.username || `user${user.id}`}</p>
                  </div>
                </div>
                
                <button
                  disabled={processingId === user.id}
                  onClick={() => handleAction(user.id, user.username)}
                  className="ml-3 shrink-0 h-9 px-4 rounded-lg bg-secondary hover:bg-destructive hover:text-destructive-foreground text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {processingId === user.id ? <Loader2 className="size-4 animate-spin" /> : <UserMinus className="size-4 hidden sm:block" />}
                  {tab === "followers" ? "Remove" : "Unfollow"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

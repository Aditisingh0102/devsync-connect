import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/lib/store";
import { api } from "@/lib/api";
import { Loader2, ArrowLeft, PlusCircle, Image as ImageIcon } from "lucide-react";
import PostCard from "@/components/PostCard";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function ProfilePosts() {
  const { state } = useApp();
  const me = state.currentUser;
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (me?.username) {
      setLoading(true);
      // Wait, we can get posts from state.posts where authorId === me.id, or fetch from api.getMe() or api.getDashboard()
      // Let's rely on state.posts as the single source of truth for now, and fallback to profile data.
      const userPosts = Object.values(state.posts).filter((p: any) => p.authorId === me.id);
      userPosts.sort((a: any, b: any) => +new Date(b.createdAt) - +new Date(a.createdAt));
      setPosts(userPosts);
      
      // Fetch from getUserProfile because /users/me doesn't include posts_by_user
      api.getUserProfile(me.username).then((data) => {
         if (data.posts_by_user) {
            setPosts(data.posts_by_user);
         }
      }).catch((err) => { 
        console.error(err); 
        toast.error("Failed to load posts. Is your backend fully deployed?"); 
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [me, state.posts]);

  if (!me) {
    return (
      <div className="container py-20 flex flex-col items-center justify-center text-center">
        <ImageIcon className="size-10 text-muted-foreground opacity-50 mb-4" />
        <h2 className="text-xl font-semibold">Please log in</h2>
        <p className="text-muted-foreground mt-2">You need to be logged in to view your posts.</p>
        <button onClick={() => navigate("/login")} className="mt-6 px-6 py-2 bg-primary text-white rounded-xl">Go to Login</button>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate("/profile")} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="size-4" /> Back to Profile
        </button>
        <button onClick={() => navigate("/feed")} className="h-9 px-4 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 flex items-center gap-2">
          <PlusCircle className="size-4" /> Create Post
        </button>
      </div>

      <div className="ds-card p-6 mb-6 bg-gradient-hero">
        <h1 className="ds-page-title mb-2">My Posts</h1>
        <p className="text-muted-foreground">Manage your content, share updates, and see your activity.</p>
      </div>

      {loading ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="ds-card p-5 space-y-4 h-[300px]">
              <div className="flex gap-3 items-center">
                <Skeleton className="size-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="ds-card h-[400px] flex flex-col items-center justify-center text-center p-6">
          <div className="size-20 rounded-full bg-secondary flex items-center justify-center mb-6">
            <ImageIcon className="size-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-bold mb-2">You haven't posted anything yet!</h2>
          <p className="text-muted-foreground max-w-md mb-8">
            Share your progress, ask for feedback, or post a new project idea to your network.
          </p>
          <button 
            onClick={() => navigate("/feed")} 
            className="h-12 px-8 rounded-xl bg-primary text-white font-semibold flex items-center gap-2 hover:bg-primary-hover hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/25"
          >
            <PlusCircle className="size-5" />
            Create New Post
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <div key={post.id} className="flex h-full">
              <PostCard post={post} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

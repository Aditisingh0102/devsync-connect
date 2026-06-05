import { Link } from "react-router-dom";
import { Post } from "@/lib/types";
import { useApp } from "@/lib/store";
import { Bookmark, MessageSquare, Send } from "lucide-react";

export default function PostCard({ post, onRespond }: { post: Post; onRespond?: (post: Post) => void }) {
  const { state, dispatch } = useApp();
  const author = state.users[post.authorId];
  const isImageAvatar = !!author?.avatar && /^(data:|https?:\/\/)/.test(author.avatar);
  const isFollowing = !!state.currentUser && (state.currentUser.following || []).includes(author?.id || "");
  const isSaved = !!state.currentUser && (state.currentUser.savedPosts || []).includes(post.id);
  const initials = (author?.name || "U").split(" ").map((s) => s[0]).slice(0, 2).join("");

  return (
    <div className="ds-card ds-card-hover p-5">
      <div className="flex items-start gap-3">
        <div className="size-11 rounded-2xl bg-gradient-primary text-white text-sm font-semibold flex items-center justify-center shrink-0">{initials}</div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <Link to={author ? `/profile/${author.id}` : "#"} className="font-semibold text-sm hover:text-primary truncate block">{author?.name || "Unknown"}</Link>
              <div className="text-xs text-muted-foreground">@{author?.username || "user"} · {new Date(post.createdAt).toLocaleDateString()}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="ds-chip-primary">{post.type}</span>
              {author && state.currentUser && author.id !== state.currentUser.id && (
                <button
                  onClick={() => {
                    const me = state.currentUser;
                    if (!me) return;
                    if (isFollowing) dispatch({ type: "unfollow", payload: { fromId: me.id, toId: author.id } });
                    else dispatch({ type: "follow", payload: { fromId: me.id, toId: author.id } });
                  }}
                  className={`h-8 px-3 rounded-xl text-xs font-semibold ${isFollowing ? "bg-card border border-border" : "bg-primary text-white"}`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </div>
          </div>

          <h4 className="font-semibold mt-3 text-base leading-snug text-foreground flex items-center gap-2">
            <span className="text-xs font-normal px-2 py-0.5 rounded bg-primary-soft text-primary">{post.projectType || "Project"}</span>
            {post.title}
          </h4>
          <p className="mt-1 text-sm text-muted-foreground">{post.body}</p>

          {post.imageUrl && (
            <div className="mt-3 rounded-xl overflow-hidden border border-border bg-surface-alt max-h-60">
              <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover max-h-60" />
            </div>
          )}

          {/* Project Details Grid */}
          {(post.projectName || post.projectType || post.domain || post.lookingFor || post.referenceLink) && (
            <div className="grid grid-cols-2 gap-3 mt-3.5 p-3 rounded-xl bg-surface-alt border border-border text-xs">
              {post.projectName && (
                <div className="col-span-2 pb-1.5 border-b border-border/50">
                  <span className="text-muted-foreground block uppercase font-medium tracking-wider text-[9px]">Project Name</span>
                  <span className="font-semibold text-foreground text-sm mt-0.5 block">{post.projectName}</span>
                </div>
              )}
              {post.projectType && (
                <div>
                  <span className="text-muted-foreground block uppercase font-medium tracking-wider text-[9px]">Project Type</span>
                  <span className="font-semibold text-foreground mt-0.5 block">{post.projectType}</span>
                </div>
              )}
              {post.domain && (
                <div>
                  <span className="text-muted-foreground block uppercase font-medium tracking-wider text-[9px]">Domain(s)</span>
                  <span className="font-semibold text-foreground mt-0.5 block">
                    {Array.isArray(post.domain) ? post.domain.join(", ") : post.domain}
                  </span>
                </div>
              )}
              {post.lookingFor && (
                <div className="col-span-2 border-t border-border/50 pt-2 mt-1">
                  <span className="text-muted-foreground block uppercase font-medium tracking-wider text-[9px] mb-1.5">Looking For (Roles/Skills)</span>
                  <div className="flex flex-wrap gap-1.5">
                    {Array.isArray(post.lookingFor) ? (
                      post.lookingFor.map((role) => (
                        <span key={role} className="px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold text-[10px]">
                          {role}
                        </span>
                      ))
                    ) : (
                      (post.lookingFor || "").split(",").map((s) => s.trim()).filter(Boolean).map((role) => (
                        <span key={role} className="px-2 py-0.5 rounded bg-primary/10 text-primary font-semibold text-[10px]">
                          {role}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              )}
              {post.referenceLink && (
                <div className="col-span-2 border-t border-border/50 pt-2 mt-1">
                  <span className="text-muted-foreground block uppercase font-medium tracking-wider text-[9px]">Reference Link</span>
                  <a href={post.referenceLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold mt-0.5 block truncate">
                    {post.referenceLink}
                  </a>
                </div>
              )}
            </div>
          )}

          {(post.tech && post.tech.length > 0) && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {post.tech.map((t) => <span key={t} className="ds-chip text-[10px]">{t}</span>)}
            </div>
          )}

          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <button onClick={() => onRespond && onRespond(post)} className="h-9 px-3 rounded-xl bg-primary text-white text-sm font-semibold inline-flex items-center gap-1.5 hover:bg-primary-hover"><Send className="size-3.5" /> Apply</button>
            <Link to={`/post/${post.id}`} className="h-9 px-3 rounded-xl bg-card border border-border text-sm font-medium inline-flex items-center gap-1.5 hover:bg-secondary"><MessageSquare className="size-3.5" /> View</Link>
            <button
              onClick={() => {
                if (!state.currentUser) return;
                dispatch({ type: "toggleSavePost", payload: { postId: post.id } });
              }}
              disabled={!state.currentUser}
              className={`h-9 px-3 rounded-xl text-sm font-medium inline-flex items-center gap-1.5 transition-all ${
                isSaved
                  ? "bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                  : "bg-secondary text-muted-foreground hover:bg-accent disabled:opacity-50"
              }`}
            >
              <Bookmark className={`size-3.5 ${isSaved ? "fill-primary" : ""}`} />
              {isSaved ? "Saved" : "Save"}
            </button>
            <span className="text-xs text-muted-foreground ml-auto">{(post.responses || []).length} responses</span>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { Post } from "@/lib/types";
import { useApp } from "@/lib/store";
import UserFollowButton from "./UserFollowButton";
import { Bookmark, MessageSquare, Send } from "lucide-react";

export default function PostCard({ post, onRespond }: { post: Post; onRespond?: (post: Post) => void }) {
  const { state } = useApp();
  const author = state.users[post.authorId];
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
              {author && state.currentUser && author.id !== state.currentUser.id && <UserFollowButton userId={author.id} />}
            </div>
          </div>

          <h4 className="font-semibold mt-3 leading-snug">{post.title}</h4>
          <p className="mt-1 text-sm text-muted-foreground">{post.body}</p>

          {(post.tech && post.tech.length > 0) && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {post.domain && <span className="ds-chip">{post.domain}</span>}
              {post.tech.map((t) => <span key={t} className="ds-chip">{t}</span>)}
            </div>
          )}

          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <button onClick={() => onRespond && onRespond(post)} className="h-9 px-3 rounded-xl bg-primary text-white text-sm font-semibold inline-flex items-center gap-1.5 hover:bg-primary-hover"><Send className="size-3.5" /> Apply</button>
            <Link to={`/post/${post.id}`} className="h-9 px-3 rounded-xl bg-card border border-border text-sm font-medium inline-flex items-center gap-1.5 hover:bg-secondary"><MessageSquare className="size-3.5" /> View</Link>
            <button className="h-9 px-3 rounded-xl bg-secondary text-sm font-medium inline-flex items-center gap-1.5 hover:bg-accent"><Bookmark className="size-3.5" /> Save</button>
            <span className="text-xs text-muted-foreground ml-auto">{(post.responses || []).length} responses</span>
          </div>
        </div>
      </div>
    </div>
  );
}

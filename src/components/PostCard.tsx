import { Link } from "react-router-dom";
import { Post } from "@/lib/types";
import { useApp } from "@/lib/store";
import UserFollowButton from "./UserFollowButton";
import { Bookmark, MessageSquare, Send } from "lucide-react";

export default function PostCard({ post, onRespond }: { post: Post; onRespond?: (post: Post) => void }) {
  const { state, dispatch } = useApp();
  const author = state.users[post.authorId];
  const isImageAvatar = !!author?.avatar && /^(data:|https?:\/\/)/.test(author.avatar);
  const isFollowing = !!state.currentUser && (state.currentUser.following || []).includes(author?.id || "");

  return (
    <div className="ds-card ds-card-hover p-5">
      <div className="flex items-start gap-3">
        <div className="size-10 rounded-full bg-gradient-primary text-white flex items-center justify-center overflow-hidden shrink-0">
          {isImageAvatar ? <img src={author?.avatar} alt={author?.name || "Author"} className="size-full object-cover" /> : (author?.avatar || "U")}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-semibold">{post.title}</div>
              <div className="text-xs text-muted-foreground">{author?.name} · {author?.handle || author?.username || "@builder"} · {new Date(post.createdAt).toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">{post.domain}</div>
              {post.projectType && <span className="ds-chip-primary text-[10px] py-1">{post.projectType}</span>}
              <button onClick={() => {
                const me = state.currentUser; if (!me) return;
                if (isFollowing) dispatch({ type: "unfollow", payload: { fromId: me.id, toId: author?.id || "" } });
                else dispatch({ type: "follow", payload: { fromId: me.id, toId: author?.id || "" } });
              }} className={`h-8 px-3 rounded-xl ${isFollowing ? "bg-card border border-border" : "bg-primary text-white"}`}>
                {isFollowing ? "Following" : "Follow"}
              </button>
            </div>
          </div>
          <p className="mt-3 text-sm text-foreground">{post.body}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(post.tech || []).map((t) => <span key={t} className="ds-chip text-[10px] py-1">{t}</span>)}
            {post.lookingFor?.length ? <span className="ds-chip-primary text-[10px] py-1">Looking for {post.lookingFor.join(", ")}</span> : null}
          </div>
          {post.imageUrl && (
            <div className="mt-3 rounded-xl overflow-hidden border border-border bg-surface-alt">
              <img src={post.imageUrl} alt={post.title} className="w-full max-h-72 object-cover" />
            </div>
          )}
          {post.referenceLink && (
            <a href={post.referenceLink} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-xs font-semibold text-primary hover:text-primary-hover">Open reference</a>
          )}
          <div className="flex items-center gap-2 mt-3">
            <button onClick={() => onRespond && onRespond(post)} className="h-9 px-3 rounded-xl bg-card border border-border">Respond</button>
            <button className="h-9 px-3 rounded-xl bg-primary text-white">Apply</button>
            <button className="h-9 px-3 rounded-xl bg-secondary">View Details</button>
            <button className="h-9 px-3 rounded-xl bg-card border border-border">View Profile</button>
          </div>
        </div>
      </div>
    </div>
  );
}

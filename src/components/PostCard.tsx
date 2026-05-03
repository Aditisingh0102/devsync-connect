import React from "react";
import { Post } from "@/lib/types";
import { useApp } from "@/lib/store";

export default function PostCard({ post, onRespond }: { post: Post; onRespond?: (post: Post) => void }) {
  const { state, dispatch } = useApp();
  const author = state.users[post.authorId];
  const isImageAvatar = !!author?.avatar && /^(data:|https?:\/\/)/.test(author.avatar);

  return (
    <div className="ds-card p-4">
      <div className="flex items-start gap-3">
        <div className="size-10 rounded-full bg-gradient-primary text-white flex items-center justify-center overflow-hidden shrink-0">
          {isImageAvatar ? <img src={author?.avatar} alt={author?.name || "Author"} className="size-full object-cover" /> : (author?.avatar || "U")}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-semibold">{post.title}</div>
              <div className="text-xs text-muted-foreground">{author?.name} · {new Date(post.createdAt).toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">{post.domain}</div>
              {/* follow button */}
              <div>
                {/* lazy-load follow UI */}
                <button onClick={() => {
                  const me = state.currentUser; if (!me) return;
                  const isFollowing = (me.following || []).includes(author?.id || "");
                  if (isFollowing) dispatch({ type: "unfollow", payload: { fromId: me.id, toId: author?.id || "" } });
                  else dispatch({ type: "follow", payload: { fromId: me.id, toId: author?.id || "" } });
                }} className={`h-8 px-3 rounded-xl ${state.currentUser && (state.currentUser.following || []).includes(author?.id || "") ? "bg-card border border-border" : "bg-primary text-white"}`}>
                  {state.currentUser && (state.currentUser.following || []).includes(author?.id || "") ? "Following" : "Follow"}
                </button>
              </div>
            </div>
          </div>
          <p className="mt-3 text-sm text-foreground">{post.body}</p>
          <div className="flex items-center gap-2 mt-3">
            <button onClick={() => onRespond && onRespond(post)} className="h-9 px-3 rounded-xl bg-card border border-border">Respond</button>
            <button className="h-9 px-3 rounded-xl bg-primary text-white">Apply</button>
            <button className="h-9 px-3 rounded-xl bg-secondary">View Details</button>
          </div>
        </div>
      </div>
    </div>
  );
}

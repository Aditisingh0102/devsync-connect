import React from "react";
import { useParams } from "react-router-dom";
import { useApp } from "@/lib/store";

export default function PostPage() {
  const { id } = useParams();
  const { state } = useApp();
  const post = id ? state.posts[id] : undefined;
  if (!post) return <div className="container py-10">Post not found.</div>;

  const author = state.users[post.authorId];

  return (
    <div className="container py-10">
      <div className="ds-card p-6">
        <div className="flex items-start gap-4">
          <div className="size-12 rounded-full bg-gradient-primary text-white flex items-center justify-center">{author?.avatar}</div>
          <div>
            <div className="font-semibold text-lg">{post.title}</div>
            <div className="text-xs text-muted-foreground">{author?.name} · {new Date(post.createdAt).toLocaleString()}</div>
            <p className="mt-4 text-sm">{post.body}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

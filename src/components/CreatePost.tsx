import React, { useState } from "react";
import { useApp, createPostDraft } from "@/lib/store";
import { PostType } from "@/lib/types";

const postTypes: PostType[] = [
  "Looking for Team",
  "Seeking Contributor",
  "Open to Join",
  "Project Update",
  "Hiring for Hackathon",
  "Final Year Project Need",
  "Open Source Collaboration",
  "Resource Share",
];

export default function CreatePost() {
  const { state, dispatch } = useApp();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<PostType>("Looking for Team");
  const [domain, setDomain] = useState("");
  const [tech, setTech] = useState("");

  const submit = () => {
    if (!state.currentUser) return;
    const p = createPostDraft({ authorId: state.currentUser.id, title, body, type, domain, tech: tech.split(",").map((s) => s.trim()).filter(Boolean) });
    dispatch({ type: "createPost", payload: p });
    setTitle(""); setBody(""); setTech(""); setDomain("");
  };

  if (!state.currentUser) {
    return (
      <div className="ds-card p-4 mb-4 text-sm text-muted-foreground">
        Log in to create collaboration posts and share what you need.
      </div>
    );
  }

  return (
    <div className="ds-card p-4 mb-4">
      <div className="flex gap-3">
        <div className="size-10 rounded-full bg-gradient-primary text-white flex items-center justify-center">{state.currentUser?.avatar || ""}</div>
        <div className="flex-1">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Post title or headline" className="ds-input mb-2" />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Describe what you're looking for..." className="ds-input mb-2 resize-none" rows={3} />
          <div className="flex gap-2 items-center">
            <select value={type} onChange={(e) => setType(e.target.value as PostType)} className="ds-input w-auto">
              {postTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <input value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="Domain (e.g., Frontend)" className="ds-input w-48" />
            <input value={tech} onChange={(e) => setTech(e.target.value)} placeholder="Tech (comma-separated)" className="ds-input w-48" />
            <button onClick={submit} className="h-10 px-4 rounded-xl bg-primary text-white">Post</button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { useApp, createResponseDraft } from "@/lib/store";

export default function RespondModal({ postId, open, onClose, onSubmit }: { postId: string; open: boolean; onClose: () => void; onSubmit: (data: any) => void }) {
  const { state } = useApp();
  const [message, setMessage] = useState("");
  const [skills, setSkills] = useState("");

  if (!open) return null;

  const post = state.posts[postId];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="ds-card p-6 z-10 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Respond to: {post?.title}</h3>
          <button onClick={onClose} className="text-muted-foreground">Close</button>
        </div>
        <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Short note about why you'd be a fit" className="ds-input mb-3 resize-none" rows={4} />
        <input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Skills summary (comma-separated)" className="ds-input mb-3" />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="h-10 px-4 rounded-xl bg-card border">Cancel</button>
          <button onClick={() => { onSubmit({ postId, message, skills: skills.split(",").map((s) => s.trim()).filter(Boolean) }); }} className="h-10 px-4 rounded-xl bg-primary text-white">Send</button>
        </div>
      </div>
    </div>
  );
}

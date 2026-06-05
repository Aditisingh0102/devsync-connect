import React, { useState } from "react";
import Feed from "@/components/Feed";
import CreatePostModal from "@/components/CreatePostModal";
import { Plus } from "lucide-react";

export default function FeedPage() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="container py-10 space-y-6">
      {/* Header section */}
      <div className="ds-card p-7 bg-gradient-hero flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <div className="relative z-10">
          <span className="ds-chip-primary">Feed</span>
          <h1 className="ds-page-title mt-2">Collaboration Feed</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Browse requests, share updates, and connect with other builders working on student projects.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="relative z-10 h-11 px-5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover shadow-glow inline-flex items-center gap-2 transition-all shrink-0 self-start md:self-auto"
        >
          <Plus className="size-4" /> Post a Project
        </button>
      </div>

      <Feed />

      <CreatePostModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}

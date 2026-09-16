import React from "react";
import { Link } from "react-router-dom";
import { FolderKanban, X } from "lucide-react";

interface AccessDeniedModalProps {
  open: boolean;
  onClose: () => void;
  message?: string;
}

export default function AccessDeniedModal({ open, onClose, message }: AccessDeniedModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="ds-card p-8 z-10 w-full max-w-md relative animate-in fade-in zoom-in-95 duration-200 text-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground size-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
          aria-label="Close modal"
        >
          <X className="size-4" />
        </button>

        <FolderKanban className="size-16 text-primary mx-auto opacity-70 animate-pulse mb-4 mt-2" />
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground text-sm mb-6">
          {message || "Please log in to manage your student projects, view active collaborations, or start a new building team."}
        </p>
        <Link
          to="/login"
          className="h-11 px-6 rounded-xl bg-primary text-white font-semibold inline-flex items-center justify-center hover:bg-primary-hover shadow-glow transition-all"
        >
          Go to Login
        </Link>
      </div>
    </div>
  );
}

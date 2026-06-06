import React, { useState, useEffect } from "react";
import { useApp } from "@/lib/store";
import { Project } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { X, Pencil } from "lucide-react";

interface EditProjectModalProps {
  open: boolean;
  onClose: () => void;
  project: Project | null;
}

const CATEGORIES = [
  "Web",
  "Mobile",
  "AI/ML",
  "Data Science",
  "Cybersecurity",
  "Design",
  "Research",
  "Other"
];

export default function EditProjectModal({ open, onClose, project }: EditProjectModalProps) {
  const { dispatch } = useApp();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [team, setTeam] = useState("");
  const [description, setDescription] = useState("");
  const [tech, setTech] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<"Recruiting" | "In Progress" | "Completed">("Recruiting");
  const [progress, setProgress] = useState(0);
  const [members, setMembers] = useState(1);
  const [maxMembers, setMaxMembers] = useState(4);
  const [visibility, setVisibility] = useState<"public" | "private" | "friends">("public");

  useEffect(() => {
    if (project) {
      setTitle(project.title || "");
      setTeam(project.team || "");
      setDescription(project.description || "");
      setTech((project.tech || []).join(", "));
      setCategory(project.category || "Web");
      setStatus(project.status || "Recruiting");
      setProgress(project.progress || 0);
      setMembers(project.members || 1);
      setMaxMembers(project.maxMembers || 4);
      setVisibility(project.visibility || "public");
    }
  }, [project, open]);

  if (!open || !project) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: "Validation Error",
        description: "Project title is required.",
        variant: "destructive",
      });
      return;
    }

    if (!team.trim()) {
      toast({
        title: "Validation Error",
        description: "Team name is required.",
        variant: "destructive",
      });
      return;
    }

    const updatedProject: Project = {
      ...project,
      title: title.trim(),
      team: team.trim(),
      description: description.trim(),
      tech: tech.split(",").map((s) => s.trim()).filter(Boolean),
      category,
      status,
      progress: Number(progress),
      members: Number(members),
      maxMembers: Number(maxMembers),
      visibility,
    };

    dispatch({ type: "updateProject", payload: updatedProject });

    toast({
      title: "Success!",
      description: `"${title}" has been updated successfully.`,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="ds-card p-6 z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground size-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
          aria-label="Close modal"
        >
          <X className="size-5" />
        </button>

        <div className="flex items-center gap-2 mb-6">
          <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Pencil className="size-4.5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">Edit Project Details</h3>
            <p className="text-sm text-muted-foreground">Update the title, status, progress, and details of your project.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Title */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Project Title <span className="text-primary">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. HackPrep Planner"
              className="ds-input"
              required
            />
          </div>

          {/* Team Name */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Team Name <span className="text-primary">*</span>
            </label>
            <input
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              placeholder="e.g. Team DevSync"
              className="ds-input"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Description / Details
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your project progress, roadmap, or goals..."
              className="ds-input resize-none min-h-[80px]"
              rows={3}
            />
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="ds-input appearance-none"
                aria-label="Select Category"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="ds-input appearance-none"
                aria-label="Select Status"
              >
                <option value="Recruiting">Recruiting</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Tech Stack & Visibility */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Tech Stack (comma-separated)
              </label>
              <input
                value={tech}
                onChange={(e) => setTech(e.target.value)}
                placeholder="e.g. React, TypeScript, TailwindCSS"
                className="ds-input"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Project Visibility
              </label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as any)}
                className="ds-input appearance-none"
                aria-label="Select Visibility"
              >
                <option value="public">Public (Visible to everyone)</option>
                <option value="private">Private (Only visible to owner)</option>
                <option value="friends">Friends (Visible to followers)</option>
              </select>
            </div>
          </div>

          {/* Progress Slider */}
          <div>
            <div className="flex justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
              <span>Development Progress</span>
              <span className="text-primary font-bold">{progress}%</span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                aria-label="Development Progress Percentage"
              />
            </div>
          </div>

          {/* Members count */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Current Members Count
              </label>
              <input
                type="number"
                min="1"
                max={maxMembers}
                value={members}
                onChange={(e) => setMembers(Number(e.target.value))}
                className="ds-input"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Max Members Capacity
              </label>
              <input
                type="number"
                min={members}
                value={maxMembers}
                onChange={(e) => setMaxMembers(Number(e.target.value))}
                className="ds-input"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-6 rounded-xl bg-card border border-border text-sm font-semibold text-foreground hover:bg-secondary transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-11 px-6 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover shadow-glow transition-all"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

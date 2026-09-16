import { Link } from "react-router-dom";
import { Users, ArrowRight, Sparkles } from "lucide-react";
import { Project } from "@/lib/types";
import { useEffect, useRef, type MouseEvent } from "react";
import { useApp } from "@/lib/store";

const statusStyles: Record<string, string> = {
  Recruiting: "bg-success-bg text-success",
  "In Progress": "bg-primary-soft text-primary",
  Completed: "bg-secondary text-muted-foreground",
};

export default function ProjectCard({
  project,
  gateProjectDetails = false,
  onProjectDetailsBlocked,
}: {
  project: Project;
  gateProjectDetails?: boolean;
  onProjectDetailsBlocked?: () => void;
}) {
  const { state } = useApp();
  const progressRef = useRef<HTMLDivElement | null>(null);

  const handleProjectLinkClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!gateProjectDetails) return;
    event.preventDefault();
    event.stopPropagation();
    onProjectDetailsBlocked?.();
  };

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.width = `${project.progress || 0}%`;
    }
  }, [project.progress]);

  // Calculate Match Score
  const mySkills = state.currentUser?.skills?.map((s: string) => s.toLowerCase()) || [];
  const projectTech = (project.tech || []).map((t: string) => t.toLowerCase());
  const projectRoles = (project.roles || []).map((r: string) => r.toLowerCase());
  const projectTags = Array.from(new Set([...projectTech, ...projectRoles]));
  
  let matchScore = 0;
  if (mySkills.length > 0 && projectTags.length > 0) {
    const matches = projectTags.filter((t: string) => mySkills.some(s => t.includes(s) || s.includes(t))).length;
    // Cap at 100% and provide a small base score if there's at least one match to show some percentage
    matchScore = Math.min(100, Math.round((matches / projectTags.length) * 100));
    if (matches > 0 && matchScore < 10) matchScore = 15; // Minimum 15% if any match
  }

  return (
    <div className="ds-card ds-card-hover p-5 flex flex-col gap-4 group">
      <div className="flex items-start justify-between gap-2">
        <span className={`ds-chip ${statusStyles[project.status] || "bg-primary-soft text-primary"}`}>{project.status || "Recruiting"}</span>
        <div className="flex items-center gap-2">
          {matchScore > 0 && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple/10 text-purple border border-purple/20 flex items-center gap-1" title={`${matchScore}% match based on your skills`}>
              <Sparkles className="size-3" /> {matchScore}% Match
            </span>
          )}
          <span className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider border ${
            project.visibility === "private"
              ? "bg-danger/10 text-danger border-danger/25"
              : project.visibility === "friends"
              ? "bg-success-bg text-success border-success/20"
              : "bg-primary-soft text-primary border-primary/20"
          }`}>
            {project.visibility || "public"}
          </span>
        </div>
      </div>

      <Link to={`/project/${project.id}`} className="block" onClick={handleProjectLinkClick}>
        <h3 className="font-semibold text-lg leading-snug group-hover:text-primary transition-colors">{project.title || project.name || "Untitled Project"}</h3>
        <p className="text-xs text-muted-foreground mt-1">by {project.owner || "Unknown"} · {project.team || "Independent"}</p>
      </Link>

      <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>

      <div className="flex flex-wrap gap-1.5">
        {(project.tech || []).slice(0, 4).map((t: string) => <span key={t} className="ds-chip">{t}</span>)}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {(project.roles || []).map((r: string) => <span key={r} className="ds-chip-primary">{r}</span>)}
      </div>

      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>Progress</span><span>{project.progress || 0}%</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div ref={progressRef} className="h-full bg-gradient-primary rounded-full transition-all" />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="size-3.5" />{project.members || 1}/{project.maxMembers || project.max_members || 5} members
        </div>
        <Link
          to={`/project/${project.id}`}
          className="text-sm font-semibold text-primary hover:text-primary-hover flex items-center gap-1"
          onClick={handleProjectLinkClick}
        >
          Join <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { Users, ArrowRight } from "lucide-react";
import { Project } from "@/lib/types";
import { useEffect, useRef } from "react";

const statusStyles: Record<Project["status"], string> = {
  Recruiting: "bg-success-bg text-success",
  "In Progress": "bg-primary-soft text-primary",
  Completed: "bg-secondary text-muted-foreground",
};

export default function ProjectCard({ project }: { project: Project }) {
  const progressRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (progressRef.current) {
      progressRef.current.style.width = `${project.progress}%`;
    }
  }, [project.progress]);

  return (
    <div className="ds-card ds-card-hover p-5 flex flex-col gap-4 group">
      <div className="flex items-start justify-between gap-2">
        <span className={`ds-chip ${statusStyles[project.status]}`}>{project.status}</span>
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

      <Link to={`/project/${project.id}`} className="block">
        <h3 className="font-semibold text-lg leading-snug group-hover:text-primary transition-colors">{project.title}</h3>
        <p className="text-xs text-muted-foreground mt-1">by {project.owner} · {project.team}</p>
      </Link>

      <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>

      <div className="flex flex-wrap gap-1.5">
        {project.tech.slice(0, 4).map((t) => <span key={t} className="ds-chip">{t}</span>)}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {project.roles.map((r) => <span key={r} className="ds-chip-primary">{r}</span>)}
      </div>

      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>Progress</span><span>{project.progress}%</span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div ref={progressRef} className="h-full bg-gradient-primary rounded-full transition-all" />
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="size-3.5" />{project.members}/{project.maxMembers} members
        </div>
        <Link to={`/project/${project.id}`} className="text-sm font-semibold text-primary hover:text-primary-hover flex items-center gap-1">
          Join <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { Bookmark, Users, ArrowRight } from "lucide-react";
import { Project } from "@/data/mock";
import { useState } from "react";

const statusStyles: Record<Project["status"], string> = {
  Recruiting: "bg-success-bg text-success",
  "In Progress": "bg-primary-soft text-primary",
  Completed: "bg-secondary text-muted-foreground",
};

export default function ProjectCard({ project }: { project: Project }) {
  const [saved, setSaved] = useState(!!project.bookmarked);
  return (
    <div className="ds-card ds-card-hover p-5 flex flex-col gap-4 group">
      <div className="flex items-start justify-between gap-2">
        <span className={`ds-chip ${statusStyles[project.status]}`}>{project.status}</span>
        <button
          onClick={(e) => { e.preventDefault(); setSaved(!saved); }}
          className={`size-8 rounded-lg flex items-center justify-center transition-colors ${saved ? "bg-primary-soft text-primary" : "bg-secondary text-muted-foreground hover:text-primary"}`}
          aria-label="Bookmark"
        >
          <Bookmark className="size-4" fill={saved ? "currentColor" : "none"} />
        </button>
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
          <div className="h-full bg-gradient-primary rounded-full transition-all" style={{ width: `${project.progress}%` }} />
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

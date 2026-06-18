import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { Plus, Trash2, ExternalLink, Layers, Users, FolderKanban, ShieldCheck, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, Link } from "react-router-dom";
import EditProjectModal from "@/components/EditProjectModal";
import { Project } from "@/lib/types";

export default function MyProjects() {
  const { state, dispatch } = useApp();
  const { toast } = useToast();
  const me = state.currentUser;
  const navigate = useNavigate();

  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEdit = (p: Project) => {
    setEditingProject(p);
    setIsEditModalOpen(true);
  };

  const handleToggleVisibility = (p: Project, newVis: "public" | "friends" | "private") => {
    const updated = {
      ...p,
      visibility: newVis,
    };
    dispatch({ type: "updateProject", payload: updated });
    toast({
      title: "Visibility Updated",
      description: `"${p.title}" is now ${newVis.toUpperCase()}.`,
    });
  };

  const myProjects = useMemo(() => {
    if (!me) return [];
    return Object.values(state.projects || {}).filter(
      (p) =>
        (p.ownerId && p.ownerId === me.id) ||
        (p.owner && p.owner.toLowerCase() === me.name.toLowerCase())
    );
  }, [state.projects, me]);

  const otherProjects = useMemo(() => {
    if (!me) return [];
    return Object.values(state.projects || {}).filter(
      (p) =>
        (!p.ownerId || p.ownerId !== me.id) &&
        (!p.owner || p.owner.toLowerCase() !== me.name.toLowerCase())
    );
  }, [state.projects, me]);

  if (!me) {
    return (
      <div className="container py-10">
        <div className="ds-card p-8 text-center max-w-xl mx-auto space-y-4">
          <FolderKanban className="size-16 text-primary mx-auto opacity-70 animate-pulse" />
          <h2 className="text-xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground text-sm">
            Please log in to manage your student projects, view active collaborations, or start a new building team.
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

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      dispatch({ type: "deleteProject", payload: { projectId: id } });
      toast({
        title: "Project Deleted",
        description: `"${name}" has been removed successfully.`,
      });
    }
  };

  return (
    <div className="container py-10 space-y-6">
      <div className="ds-card p-7 bg-gradient-hero flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
        <div className="relative z-10">
          <span className="ds-chip-primary">Manager</span>
          <h1 className="ds-page-title mt-2">My Projects</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">
            Create and maintain your student projects, view team metrics, and manage lists of active collaborations.
          </p>
        </div>
        <button
          onClick={() => navigate("/find-projects", { state: { openCreateModal: true } })}
          className="relative z-10 h-11 px-5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover shadow-glow inline-flex items-center gap-2 transition-all shrink-0 self-start md:self-auto"
        >
          <Plus className="size-4" /> Start a Project
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column: User's owned projects */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Layers className="size-5 text-primary" /> Owned Projects ({myProjects.length})
          </h2>

          {myProjects.length === 0 ? (
            <div className="ds-card p-12 text-center border-dashed border-border/80 flex flex-col items-center justify-center">
              <button
                onClick={() => navigate("/find-projects", { state: { openCreateModal: true } })}
                className="size-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center hover:scale-105 hover:bg-primary/20 transition-all mb-4 group"
                aria-label="Start a project"
              >
                <FolderKanban className="size-8 group-hover:animate-pulse" />
              </button>
              <p className="text-muted-foreground text-sm max-w-sm">
                You haven't initialized any projects yet. Click the icon or "Start a Project" above to begin building.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {myProjects.map((p) => (
                <div key={p.id} className="ds-card p-5 flex flex-col justify-between hover:border-primary/40 transition-all group">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="ds-chip text-[10px] uppercase tracking-wider">{p.category}</span>
                        <select
                          value={p.visibility || "public"}
                          onChange={(e) => handleToggleVisibility(p, e.target.value as "public" | "friends" | "private")}
                          className={`px-1.5 py-0.5 rounded text-[8.5px] font-bold uppercase tracking-wider border cursor-pointer outline-none transition-all ${
                            p.visibility === "private"
                              ? "bg-danger/10 text-danger border-danger/20"
                              : p.visibility === "friends"
                              ? "bg-success-bg text-success border-success/15"
                              : "bg-primary-soft text-primary border-primary/15"
                          }`}
                          title="Change visibility"
                        >
                          <option value="public" className="bg-card text-foreground">Public</option>
                          <option value="friends" className="bg-card text-foreground">Friends</option>
                          <option value="private" className="bg-card text-foreground">Private</option>
                        </select>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-success-bg text-success font-semibold border border-success/15">
                        {p.status}
                      </span>
                    </div>
                    <Link to={`/project/${p.id}`}>
                      <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-1 hover:underline">
                        {p.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">{p.team}</p>
                    
                    {p.imageUrl && (
                      <div className="mt-3 mb-1 rounded-xl overflow-hidden border border-border bg-surface-alt h-32">
                        <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground mt-2.5 line-clamp-3 leading-relaxed">
                      {p.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-[10px] text-muted-foreground font-medium mb-1">
                        <span>Development Progress</span>
                        <span>{p.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-primary rounded-full" style={{ width: `${p.progress}%` }} />
                      </div>
                    </div>

                    {/* Members status */}
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs mt-3.5">
                      <Users className="size-3.5" />
                      <span>
                        {p.members} / {p.maxMembers} Members
                      </span>
                    </div>

                    {/* Tech stack tags */}
                    {p.tech.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {p.tech.slice(0, 4).map((t) => (
                          <span key={t} className="ds-chip text-[9px] py-0.5">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-border/50 pt-3 mt-4">
                    <Link
                      to={`/project/${p.id}`}
                      className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
                    >
                      Workspace <ExternalLink className="size-3" />
                    </Link>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(p)}
                        className="size-8 rounded-lg bg-primary/10 text-primary border border-primary/10 flex items-center justify-center hover:bg-primary hover:text-white transition-all"
                        aria-label="Edit project"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.title)}
                        className="size-8 rounded-lg bg-danger/10 text-danger border border-danger/10 flex items-center justify-center hover:bg-danger hover:text-white transition-all"
                        aria-label="Delete project"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Info card and list of other available projects */}
        <div className="space-y-4">
          <div className="ds-card p-6 bg-surface-alt border-border/80">
            <h2 className="text-base font-bold flex items-center gap-2 mb-3">
              <ShieldCheck className="size-4.5 text-primary" /> Active Platform Status
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Any projects you create will be added to the global student directory on the <Link to="/find-projects" className="text-primary hover:underline font-semibold">Find Projects</Link> page, enabling developers to send recruitment requests or collaboration applications.
            </p>
          </div>

          <div className="ds-card p-6 space-y-4">
            <h3 className="font-bold text-sm text-foreground uppercase tracking-wider text-muted-foreground">Other Active Projects</h3>
            <div className="space-y-3">
              {otherProjects.slice(0, 4).map((p) => (
                <div key={p.id} className="p-3.5 rounded-xl bg-secondary border border-border/40 hover:border-border transition-colors">
                  <div className="flex justify-between items-center gap-2">
                    <span className="font-semibold text-xs text-foreground truncate">{p.title}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold shrink-0">
                      {p.category}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 truncate">Led by {p.owner}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <EditProjectModal
        open={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingProject(null);
        }}
        project={editingProject}
      />
    </div>
  );
}

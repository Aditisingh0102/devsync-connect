import { useParams, Link } from "react-router-dom";
import { useApp } from "@/lib/store";
import { ArrowLeft, Bookmark, CheckCircle2, Circle, Github, MessageSquare, Target, Users, FileText, X, Lock, LogIn, UserPlus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useMemo } from "react";
import ApplyRoleModal from "@/components/ApplyRoleModal";
import { toast as sonnerToast } from "sonner";
import { playSuccessSound } from "@/lib/utils";

export default function ProjectDetail() {
  const { id } = useParams();
  const { state, dispatch } = useApp();
  const { toast } = useToast();
  const projectsList = Object.values(state.projects || {});
  const p = projectsList.find((x) => x.id === id);

  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState("");

  const projectRequests = useMemo(() => {
    if (!p) return [];
    return Object.values(state.requests || {}).filter(
      (r) => r.projectId === p.id && r.status === "pending"
    );
  }, [state.requests, p?.id]);

  if (!p) {
    return (
      <div className="container py-10 text-center">
        <h2 className="text-xl font-bold">Project Not Found</h2>
        <p className="text-muted-foreground mt-2">The requested project is not available.</p>
        <Link to="/find-projects" className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline">Back to projects</Link>
      </div>
    );
  }

  if (!state.currentUser) {
    return (
      <div className="container py-16 max-w-lg min-h-[calc(100vh-8rem)] flex items-center justify-center">
        {/* Background glow */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 -right-32 size-[400px] rounded-full bg-primary/10 blur-[100px]" />
          <div className="absolute bottom-1/3 -left-32 size-[300px] rounded-full bg-purple/10 blur-[100px]" />
        </div>

        <div className="w-full text-center">
          <div className="ds-card p-8 backdrop-blur-xl border-border/50 shadow-glow relative overflow-hidden">
            {/* Header Icon */}
            <div className="relative size-20 mx-auto mb-6 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg">
              <Lock className="size-10 text-white" />
            </div>

            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-3">
              Join DevSync to View Project
            </h1>
            
            <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm mx-auto">
              Please log in to see team members, milestones, active discussions, and apply for open roles in "{p.title}".
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/login"
                className="h-11 px-6 rounded-xl bg-primary text-white font-semibold text-sm inline-flex items-center justify-center gap-2 hover:bg-primary-hover transition-all active:scale-[0.98] shadow-glow"
              >
                <LogIn className="size-4" />
                Sign In
              </Link>
              <Link
                to="/signup"
                className="h-11 px-6 rounded-xl bg-card border border-border text-foreground font-semibold text-sm inline-flex items-center justify-center gap-2 hover:bg-secondary transition-colors"
              >
                <UserPlus className="size-4" />
                Create Account
              </Link>
            </div>
            
            <div className="mt-8 pt-6 border-t border-border/50">
              <Link to="/find-projects" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="size-4" /> Back to projects
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleToggleSave = () => {
    const updated = {
      ...p,
      bookmarked: !p.bookmarked
    };
    dispatch({ type: "updateProject", payload: updated });
    toast({
      title: updated.bookmarked ? "Project Saved" : "Project Removed",
      description: updated.bookmarked ? `"${p.title}" has been saved.` : `"${p.title}" has been removed from saved list.`
    });
  };

  const handleApplyClick = (role: string) => {
    if (!state.currentUser) {
      toast({ title: "Authentication Required", description: "Please log in to apply.", variant: "destructive" });
      return;
    }
    if (p.ownerId === state.currentUser.id) {
      toast({ title: "Project Owner", description: "You are the owner of this project." });
      return;
    }
    if (p.members >= p.maxMembers) {
      toast({ title: "Project Full", description: "This project has already reached its maximum member capacity.", variant: "destructive" });
      return;
    }
    setSelectedRole(role);
    setIsApplyModalOpen(true);
  };

  const handleApplySubmit = (data: { message: string; skills: string[]; resume: string; resumeName: string }) => {
    if (!state.currentUser || !p.ownerId) return;

    const req = {
      id: `req_${Date.now()}`,
      fromId: state.currentUser.id,
      toId: p.ownerId,
      projectId: p.id,
      message: data.message,
      role: selectedRole,
      resume: data.resume,
      resumeName: data.resumeName,
      skills: data.skills,
      status: "pending",
      createdAt: new Date().toISOString()
    } as any;

    dispatch({ type: "sendRequest", payload: req });
    setIsApplyModalOpen(false);
    setSelectedRole("");

    playSuccessSound();
    sonnerToast.success("Application Submitted!", {
      description: `Your application to join "${p.title}" as a "${selectedRole}" has been sent.`,
      icon: "🚀"
    });
  };

  return (
    <div className="container py-10 space-y-6">
      <Link to="/find-projects" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="size-4" /> Back to projects</Link>

      <div className="ds-card p-7 bg-gradient-hero">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="ds-chip-primary">{p.status}</span>
            <h1 className="ds-page-title mt-3">{p.title}</h1>
            <p className="text-muted-foreground mt-1">by {p.owner} · {p.team}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={handleToggleSave} className="h-11 px-4 rounded-xl bg-card border border-border text-sm font-semibold inline-flex items-center gap-2 hover:bg-secondary">
              <Bookmark className={`size-4 ${p.bookmarked ? "fill-primary text-primary" : ""}`} /> {p.bookmarked ? "Saved" : "Save"}
            </button>
            <button onClick={() => handleApplyClick("General Collaborator")} className="h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold inline-flex items-center gap-2 hover:bg-primary-hover">Join Project</button>
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mt-6">
          <Stat label="Members" value={`${p.members}/${p.maxMembers}`} />
          <Stat label="Progress" value={`${p.progress}%`} />
          <Stat label="Category" value={p.category} />
        </div>
      </div>

      {p.imageUrl && (
        <div className="ds-card overflow-hidden border border-border">
          <img src={p.imageUrl} alt={p.title} className="w-full object-cover max-h-96" />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {state.currentUser && p.ownerId === state.currentUser.id && (
            <div className="ds-card p-6 border-primary/20 bg-primary-soft/10">
              <h3 className="font-semibold text-lg mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="size-5 text-primary animate-pulse" />
                  Incoming Applications
                </span>
                {projectRequests.length > 0 && (
                  <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full font-bold">
                    {projectRequests.length} pending
                  </span>
                )}
              </h3>
              
              {projectRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pending applications for this project yet. When developers apply for roles, they will show up here.</p>
              ) : (
                <div className="space-y-4 mt-4">
                  {projectRequests.map((r: any) => {
                    const applicant = state.users[r.fromId];
                    return (
                      <div key={r.id} className="p-4 rounded-xl bg-card border border-border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:border-primary/30 transition-all">
                        <div className="flex items-start gap-3">
                          <div className="size-10 rounded-xl bg-gradient-primary text-white text-xs font-semibold flex items-center justify-center shrink-0">
                            {applicant?.avatar || applicant?.name?.slice(0, 2) || "U"}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-foreground">
                              {applicant?.name || "Unknown"} <span className="font-normal text-muted-foreground text-xs">@{applicant?.username}</span>
                            </p>
                            {r.role && (
                              <p className="text-xs text-primary font-bold uppercase tracking-wider mt-0.5">
                                Applied for: {r.role}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-1.5 italic leading-relaxed">
                              "{r.message || "No message provided."}"
                            </p>
                            
                            {applicant?.skills && applicant.skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {applicant.skills.map((s: string) => (
                                  <span key={s} className="ds-chip text-[9px] py-0.5">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            )}

                            {r.resume && (
                              <div className="mt-3">
                                <a
                                  href={r.resume}
                                  download={r.resumeName || "resume.pdf"}
                                  className="h-8 px-3 rounded-lg bg-primary/10 text-primary border border-primary/10 hover:bg-primary hover:text-white transition-all text-xs font-semibold inline-flex items-center gap-1.5"
                                >
                                  <FileText className="size-3.5" /> View Resume ({r.resumeName || "resume.pdf"})
                                </a>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end md:self-center">
                          <button
                            onClick={() => dispatch({ type: "updateRequest", payload: { id: r.id, status: "accepted" } })}
                            className="h-9 px-3.5 rounded-xl bg-primary text-white text-xs font-semibold inline-flex items-center gap-1.5 hover:bg-primary-hover shadow-glow"
                          >
                            <CheckCircle2 className="size-4" /> Accept
                          </button>
                          <button
                            onClick={() => dispatch({ type: "updateRequest", payload: { id: r.id, status: "declined" } })}
                            className="h-9 px-3.5 rounded-xl bg-card border border-border text-xs font-semibold text-muted-foreground hover:bg-secondary inline-flex items-center gap-1.5"
                          >
                            <X className="size-4" /> Decline
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="ds-card p-6">
            <h3 className="font-semibold text-lg mb-2">Summary</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{p.description} The team is shipping in 2-week sprints with weekly demo sessions and async standups. Mentors review milestones and the project produces a verified portfolio entry on completion.</p>
          </div>

          <div className="ds-card p-6">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2"><Target className="size-4 text-primary" /> Goals</h3>
            <ul className="space-y-2">
              {["Ship MVP in 6 weeks", "Onboard 100 student testers", "Open-source the matching engine", "Publish learnings & demo video"].map((g) => (
                <li key={g} className="flex items-start gap-2 text-sm"><CheckCircle2 className="size-4 text-success mt-0.5" /> {g}</li>
              ))}
            </ul>
          </div>

          <div className="ds-card p-6">
            <h3 className="font-semibold text-lg mb-4">Milestones</h3>
            <div className="space-y-3">
              {[
                { name: "Discovery & wireframes", done: true },
                { name: "MVP backend", done: true },
                { name: "Beta UI shipped", done: true },
                { name: "Pilot with 3 colleges", done: false },
                { name: "Public launch", done: false },
              ].map((m, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-alt border border-border">
                  {m.done ? <CheckCircle2 className="size-5 text-success" /> : <Circle className="size-5 text-muted-foreground" />}
                  <span className={`text-sm ${m.done ? "line-through text-muted-foreground" : "font-medium"}`}>{m.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="ds-card p-6">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2"><MessageSquare className="size-4 text-primary" /> Discussion</h3>
            <div className="space-y-3">
              {[{ u: "Priya Mehta", t: "Pushed v0 of matching scoring — feedback welcome." }, { u: "Rohan Verma", t: "Profile cards in review, demo Friday." }].map((d, i) => (
                <div key={i} className="flex gap-3">
                  <div className="size-9 rounded-lg bg-gradient-primary text-white text-xs font-semibold flex items-center justify-center shrink-0">{d.u[0]}</div>
                  <div className="flex-1"><p className="text-sm"><span className="font-semibold">{d.u}</span> · 2h ago</p><p className="text-sm text-muted-foreground">{d.t}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="ds-card p-6">
            <h3 className="font-semibold text-lg mb-3">Tech Stack</h3>
            <div className="flex flex-wrap gap-1.5">{p.tech.map((t) => <span key={t} className="ds-chip">{t}</span>)}</div>
          </div>

          <div className="ds-card p-6">
            <h3 className="font-semibold text-lg mb-3">Roles Needed</h3>
            <div className="space-y-2">
              {p.roles.map((r) => (
                <div key={r} className="p-3 rounded-xl bg-surface-alt border border-border flex items-center justify-between">
                  <span className="text-sm font-medium">{r}</span>
                  <button onClick={() => handleApplyClick(r)} className="text-xs font-semibold text-primary hover:text-primary-hover">Apply</button>
                </div>
              ))}
            </div>
          </div>

          <div className="ds-card p-6">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2"><Users className="size-4 text-primary" /> Contributors ({(p.memberIds?.length || 0)})</h3>
            <div className="space-y-2">
              {(p.memberIds || []).length > 0 ? (
                (p.memberIds || []).map((memberId) => {
                  const member = state.users[memberId];
                  return (
                    <div key={memberId} className="flex items-center gap-3">
                      <div className="size-9 rounded-lg bg-gradient-primary text-white text-xs font-semibold flex items-center justify-center">
                        {member?.avatar || member?.name?.split(" ").map((n) => n[0]).join("") || "U"}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{member?.name || "Unknown User"}</span>
                        {member?.roles && member.roles.length > 0 && (
                          <span className="text-xs text-muted-foreground">{member.roles.join(", ")}</span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-muted-foreground">No members yet. Be the first to join!</div>
              )}
            </div>
          </div>

          <a href="#" className="ds-card p-4 flex items-center gap-3 hover:bg-secondary">
            <Github className="size-5" /><span className="text-sm font-medium">View on GitHub</span>
          </a>
        </div>
      </div>

      <ApplyRoleModal
        open={isApplyModalOpen}
        onClose={() => {
          setIsApplyModalOpen(false);
          setSelectedRole("");
        }}
        projectName={p.title}
        role={selectedRole}
        onSubmit={handleApplySubmit}
      />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card/80 backdrop-blur rounded-xl p-4 border border-border">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-xl font-bold mt-0.5">{value}</p>
    </div>
  );
}

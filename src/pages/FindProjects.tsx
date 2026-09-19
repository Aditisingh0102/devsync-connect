import { useMemo, useState, useEffect } from "react";
import { Link, useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { Search, SlidersHorizontal, Sparkles, ChevronLeft, ChevronRight, Plus, FolderOpen } from "lucide-react";
import { useApp } from "@/lib/store";
import ProjectCard from "@/components/ProjectCard";
import CreatePostModal from "@/components/CreatePostModal";
import AccessDeniedModal from "@/components/AccessDeniedModal";

const categories = ["All", "AI", "Web", "Mobile", "DevTools", "Productivity", "Research", "OpenSource", "Education"];
const statuses = ["All", "Recruiting", "In Progress", "Completed"];
const sorts = ["Recommended", "Newest", "Most Members", "Highest Progress"];

export default function FindProjects() {
  const { state } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") || "");

  useEffect(() => {
    setQ(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearchChange = (val: string) => {
    setQ(val);
    setPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (val) {
      newParams.set("q", val);
    } else {
      newParams.delete("q");
    }
    setSearchParams(newParams, { replace: true });
  };
  const [cat, setCat] = useState("All");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("Recommended");
  const [page, setPage] = useState(1);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [accessDeniedOpen, setAccessDeniedOpen] = useState(false);
  const perPage = 12;

  useEffect(() => {
    if (location.state && (location.state as any).openCreateModal) {
      if (!state.currentUser) {
        setAccessDeniedOpen(true);
        return;
      }
      setCreateModalOpen(true);
      // Clear navigation state so that refreshing doesn't reopen the modal
      window.history.replaceState({}, document.title);
    }
  }, [location, state.currentUser, navigate]);

  // Fetch projects from backend on mount
  const [backendProjects, setBackendProjects] = useState<any[]>([]);
  useEffect(() => {
    fetch('https://backenddevsyncconnect.dev/api/v1/projects/')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setBackendProjects(data); })
      .catch(() => {});
  }, []);

  // Merge local + backend projects (backend takes priority)
  const projects = useMemo(() => {
    const localProjects = Object.values(state.projects || {});
    if (backendProjects.length > 0) {
      // Use backend projects, merge with local ones not in backend
      const backendIds = new Set(backendProjects.map(p => String(p.id)));
      const uniqueLocal = localProjects.filter(p => !backendIds.has(String(p.id)));
      return [...backendProjects, ...uniqueLocal];
    }
    return localProjects;
  }, [state.projects, backendProjects]);

  // Parse comma-separated search terms
  const searchTerms = useMemo(() => 
    q.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
  , [q]);

  const filtered = useMemo(() => {
    let r = projects.filter((p) => {
      // Visibility filtering
      if (p.visibility && p.visibility !== "public") {
        if (!state.currentUser) return false;
        if (p.ownerId !== state.currentUser.id) {
          if (p.visibility === "private") return false;
          if (p.visibility === "friends") {
            const isFollowing = (state.currentUser.following || []).includes(p.ownerId || "");
            if (!isFollowing) return false;
          }
        }
      }

      if (cat !== "All" && p.category !== cat) return false;
      if (status !== "All" && p.status !== status) return false;
      if (searchTerms.length === 0) return true;

      // Project matches if ANY search term matches any field
      return searchTerms.some((term) =>
        p.title.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.tech.some((t) => t.toLowerCase().includes(term)) ||
        p.roles.some((role) => role.toLowerCase().includes(term)) ||
        p.category.toLowerCase().includes(term)
      );
    });

    if (sort === "Most Members") {
      r = [...r].sort((a, b) => b.members - a.members);
    } else if (sort === "Highest Progress") {
      r = [...r].sort((a, b) => b.progress - a.progress);
    } else if (sort === "Newest") {
      const parseIdTime = (id: string) => {
        if (id.startsWith("proj_")) {
          const ts = parseInt(id.replace("proj_", ""));
          return isNaN(ts) ? 0 : ts;
        }
        if (id.startsWith("p")) {
          const num = parseInt(id.replace("p", ""));
          return isNaN(num) ? 0 : num;
        }
        return 0;
      };
      r = [...r].sort((a, b) => parseIdTime(b.id) - parseIdTime(a.id));
    } else if (sort === "Recommended") {
      if (searchTerms.length > 0) {
        // Sort by search relevance across all terms
        r = [...r].sort((a, b) => {
          const getRelevance = (p: typeof a) => {
            let score = 0;
            for (const term of searchTerms) {
              const title = p.title.toLowerCase();
              const desc = p.description.toLowerCase();

              if (title === term) score += 100;
              else if (title.startsWith(term)) score += 60;
              else if (title.includes(term)) score += 30;

              p.tech.forEach((t) => {
                const techLower = t.toLowerCase();
                if (techLower === term) score += 40;
                else if (techLower.includes(term)) score += 15;
              });

              p.roles.forEach((role) => {
                const roleLower = role.toLowerCase();
                if (roleLower === term) score += 20;
                else if (roleLower.includes(term)) score += 10;
              });

              if (desc.includes(term)) score += 5;
            }
            return score;
          };
          return getRelevance(b) - getRelevance(a);
        });
      } else {
        // Sort by profile skills match
        const myTech = (state.currentUser?.skills || []).map((s) => s.toLowerCase());
        if (myTech.length > 0) {
          r = [...r].sort((a, b) => {
            const getMatchCount = (p: typeof a) =>
              p.tech.filter((t) => myTech.includes(t.toLowerCase())).length;
            return getMatchCount(b) - getMatchCount(a);
          });
        }
      }
    }
    return r;
  }, [searchTerms, cat, status, sort, projects, state.currentUser?.skills]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const slice = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="container py-10">
      <div className="ds-card p-7 mb-6 bg-gradient-hero flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h1 className="ds-page-title">Find Projects</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">Discover real-world student projects matched to your skills, interests, and availability.</p>
        </div>
        <button
          onClick={() => {
            console.log("Post a New Project clicked, currentUser:", state.currentUser);
            if (!state.currentUser) {
              setAccessDeniedOpen(true);
              return;
            }
            setCreateModalOpen(true);
          }}
          className="ds-card p-4 flex items-center gap-4 border border-primary/20 hover:border-primary bg-card/30 hover:bg-card transition-all md:w-64 shrink-0 group text-left"
        >
          <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
            <Plus className="size-5" />
          </div>
          <div>
            <div className="font-semibold text-sm group-hover:text-primary transition-colors">Post a New Project</div>
            <div className="text-xs text-muted-foreground mt-0.5">Find student builders</div>
          </div>
        </button>
      </div>

      <div className="ds-card p-4 mb-6 flex flex-col lg:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 px-3 h-11 rounded-xl bg-secondary border border-border">
          <Search className="size-4 text-muted-foreground" />
          <input value={q} onChange={(e) => handleSearchChange(e.target.value)} placeholder="Search by title, tech, or skills (use , for multiple)…" className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground" />
        </div>
        <Select value={cat} onChange={(v) => { setCat(v); setPage(1); }} options={categories} label="Category" />
        <Select value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={statuses} label="Status" />
        <Select value={sort} onChange={setSort} options={sorts} label="Sort" />
      </div>

      {filtered.length > 0 && state.currentUser?.skills?.length > 0 && (() => {
        const mySkills = (state.currentUser.skills || []).map((s: string) => s.toLowerCase());
        const matchCount = filtered.filter(p => 
          (p.tech || []).some((t: string) => mySkills.includes(t.toLowerCase()))
        ).length;
        if (matchCount === 0) return null;
        return (
          <div className="ds-card p-4 mb-6 flex items-center gap-3 bg-primary-soft border-primary/20">
            <div className="size-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0"><Sparkles className="size-5" /></div>
            <div className="flex-1">
              <div className="font-semibold text-sm text-foreground">{matchCount} high-match project{matchCount !== 1 ? 's' : ''} for you</div>
              <div className="text-xs text-muted-foreground">Based on {mySkills.slice(0, 3).join(', ')}{mySkills.length > 3 ? ` and ${mySkills.length - 3} more skills` : ''}.</div>
            </div>
          </div>
        );
      })()}

      {filtered.length === 0 && !q && cat === 'All' && status === 'All' && (
        <div className="ds-card p-8 mb-6 text-center flex flex-col items-center">
          <FolderOpen className="size-12 text-muted-foreground/40 mb-3" />
          <h3 className="font-semibold text-lg">No projects yet</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-md">Be the first to post a project and find collaborators!</p>
          <button 
            onClick={() => {
              if (!state.currentUser) {
                setAccessDeniedOpen(true);
                return;
              }
              setCreateModalOpen(true);
            }}
            className="h-11 px-5 rounded-xl bg-primary text-white font-semibold inline-flex items-center justify-center gap-2 hover:bg-primary-hover shadow-glow transition-all"
          >
            <Plus className="size-4" /> Post a New Project
          </button>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">{filtered.length}</span> projects found</p>
        <div className="text-sm text-muted-foreground flex items-center gap-2"><SlidersHorizontal className="size-4" /> Sorted by {sort}</div>
      </div>

      {slice.length === 0 ? (
        <div className="ds-card p-16 text-center">
          <p className="text-muted-foreground">No projects match your filters.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {slice.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}

      {pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-10">
          <button aria-label="Previous page" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="size-10 rounded-xl bg-card border border-border disabled:opacity-40 flex items-center justify-center"><ChevronLeft className="size-4" /></button>
          {Array.from({ length: pages }).map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`size-10 rounded-xl text-sm font-semibold ${page === i + 1 ? "bg-primary text-white" : "bg-card border border-border"}`}>{i + 1}</button>
          ))}
          <button aria-label="Next page" onClick={() => setPage(Math.min(pages, page + 1))} disabled={page === pages} className="size-10 rounded-xl bg-card border border-border disabled:opacity-40 flex items-center justify-center"><ChevronRight className="size-4" /></button>
        </div>
      )}
      <CreatePostModal open={createModalOpen} onClose={() => setCreateModalOpen(false)} />
      <AccessDeniedModal open={accessDeniedOpen} onClose={() => setAccessDeniedOpen(false)} message="Please log in to post a new project and find collaborators." />
    </div>
  );
}

function Select({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: string[]; label: string }) {
  return (
    <div className="relative">
      <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className="h-11 pl-3 pr-9 rounded-xl bg-secondary border border-border text-sm font-medium appearance-none cursor-pointer outline-none focus:border-primary min-w-[140px]">
        {options.map((o) => <option key={o} value={o}>{label}: {o}</option>)}
      </select>
      <ChevronRight className="size-4 absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none text-muted-foreground" />
    </div>
  );
}


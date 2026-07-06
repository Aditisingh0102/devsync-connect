import { useMemo, useState, useEffect } from "react";
import { useApp } from "@/lib/store";
import { useSearchParams, Link } from "react-router-dom";
import { ChevronDown, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { playSuccessSound } from "@/lib/utils";

const AVAILABLE_SKILLS = [
  "React",
  "TypeScript",
  "JavaScript",
  "Python",
  "Node.js",
  "UI/UX",
  "ML/AI",
  "DevOps",
  "Next.js",
  "FastAPI",
  "Tailwind CSS",
  "Cloud / AWS",
  "Supabase",
  "PostgreSQL",
  "MongoDB",
  "Figma",
  "Docker",
  "Git / GitHub",
  "ReactNative",
  "Vue",
  "Django",
  "Firebase",
  "Flutter",
  "Angular"
];

export default function DiscoverBuilders() {
  const { state, dispatch } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [filterSkill, setFilterSkill] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredSkillsOptions = useMemo(() => {
    if (!filterSkill) return AVAILABLE_SKILLS;
    return AVAILABLE_SKILLS.filter((s) =>
      s.toLowerCase().includes(filterSkill.toLowerCase())
    );
  }, [filterSkill]);

  useEffect(() => {
    setQ(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearchChange = (val: string) => {
    setQ(val);
    const newParams = new URLSearchParams(searchParams);
    if (val) {
      newParams.set("q", val);
    } else {
      newParams.delete("q");
    }
    setSearchParams(newParams, { replace: true });
  };

  // Parse comma-separated search terms
  const users = useMemo(() => Object.values(state.users || {}), [state.users]);
  const searchTerms = useMemo(() =>
    q.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean)
  , [q]);

  const results = useMemo(() => {
    let filtered = users.filter((u) => {
      if (!u) return false;
      if (!q) return true;

      // Builder matches if ANY search term matches any field
      return searchTerms.some((term) => {
        if ((u.name || "").toLowerCase().includes(term)) return true;
        if ((u.username || "").toLowerCase().includes(term)) return true;
        if ((u.handle || "").toLowerCase().includes(term)) return true;
        if ((u.skills || []).some((s) => s.toLowerCase().includes(term))) return true;
        if ((u.domains || []).some((d) => d.toLowerCase().includes(term))) return true;
        return false;
      });
    }).filter((u) => !filterSkill || (u.skills || []).map((x) => x.toLowerCase()).includes(filterSkill.toLowerCase()));

    if (searchTerms.length > 0) {
      filtered = [...filtered].sort((a, b) => {
        const getRelevance = (u: typeof a) => {
          let score = 0;
          for (const term of searchTerms) {
            const name = (u.name || "").toLowerCase();
            const username = (u.username || "").toLowerCase();
            const handle = (u.handle || "").toLowerCase();

            if (name === term || username === term || handle === term) score += 100;
            else if (name.startsWith(term) || username.startsWith(term) || handle.startsWith(term)) score += 60;
            else if (name.includes(term) || username.includes(term) || handle.includes(term)) score += 30;

            (u.skills || []).forEach((skill) => {
              const skillLower = skill.toLowerCase();
              if (skillLower === term) score += 40;
              else if (skillLower.includes(term)) score += 15;
            });

            (u.domains || []).forEach((domain) => {
              const domainLower = domain.toLowerCase();
              if (domainLower === term) score += 20;
              else if (domainLower.includes(term)) score += 10;
            });
          }
          return score;
        };
        return getRelevance(b) - getRelevance(a);
      });
    }
    return filtered;
  }, [users, searchTerms, filterSkill, q]);

  const follow = (toId: string) => {
    if (!state.currentUser) return;
    dispatch({ type: "follow", payload: { fromId: state.currentUser.id, toId } });
    playSuccessSound();
    toast.success("Followed successfully!", {
      description: "You will now see their posts.",
      icon: "🎉"
    });
  };
  const unfollow = (toId: string) => {
    if (!state.currentUser) return;
    dispatch({ type: "unfollow", payload: { fromId: state.currentUser.id, toId } });
  };

  const sendRequest = (toId: string) => {
    if (!state.currentUser) return;
    const req = { id: `req_${Date.now()}`, fromId: state.currentUser.id, toId, message: "Hi — I'd like to collaborate on your project", status: "pending", createdAt: new Date().toISOString() } as any;
    dispatch({ type: "sendRequest", payload: req });
    playSuccessSound();
    toast.success("Connection Request Sent", {
      description: "We'll let you know when they respond.",
      icon: "✨"
    });
  };

  return (
    <div className="container py-10">
      <div className="ds-card p-6 mb-6">
        <h1 className="text-2xl font-semibold">Discover Builders</h1>
        <p className="text-sm text-muted-foreground">Search builders by name, username, skills, or domain.</p>
        <div className="mt-4 flex gap-2">
          <input placeholder="Search builders..." value={q} onChange={(e)=>handleSearchChange(e.target.value)} className="ds-input" />
          
          {/* Custom Searchable Select Dropdown */}
          <div className="relative w-56 shrink-0">
            <div className="relative">
              <input 
                placeholder="Filter skill (optional)" 
                value={filterSkill} 
                onChange={(e) => {
                  setFilterSkill(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                className="ds-input w-full pr-14" 
              />
              {filterSkill && (
                <button
                  type="button"
                  onClick={() => setFilterSkill("")}
                  className="absolute right-8 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <ChevronDown className="size-4" />
              </button>
            </div>

            {isOpen && (
              <>
                {/* Backdrop to close dropdown on click outside */}
                <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                
                {/* Dropdown Options List */}
                <div className="absolute top-12 left-0 right-0 z-50 bg-card border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto p-1 divide-y divide-border/50 animate-in fade-in slide-in-from-top-1 duration-100">
                  {filteredSkillsOptions.length > 0 ? (
                    filteredSkillsOptions.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => {
                          setFilterSkill(skill);
                          setIsOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center justify-between ${
                          filterSkill.toLowerCase() === skill.toLowerCase()
                            ? "bg-[#ede9fe] dark:bg-primary-soft text-[#4338ca] dark:text-primary font-semibold"
                            : "text-foreground hover:bg-secondary hover:text-primary"
                        }`}
                      >
                        {skill}
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                      No skills found
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="ds-card p-4 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Skeleton className="size-12 rounded-full shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-3 w-[180px]" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-14 rounded-full" />
              </div>
              <div className="mt-2">
                <Skeleton className="h-9 w-24 rounded-xl" />
              </div>
            </div>
          ))
        ) : results.length ? results.map(u => (
          <div key={u.id} className="ds-card p-4">
            <Link to={`/profile/${u.id}`} className="flex items-center gap-3 hover:opacity-85 transition-opacity text-foreground no-underline">
              <div className="size-12 rounded-full bg-gradient-primary text-white flex items-center justify-center shrink-0 overflow-hidden">
                {u.avatar && /^(data:|https?:\/\/)/.test(u.avatar) ? (
                  <img src={u.avatar} alt={u.name || "Profile"} className="size-full object-cover" />
                ) : (
                  (u.name||"U").split(" ").map((s:any)=>s[0]).slice(0,2).join("")
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between"><div>
                  <div className="font-semibold">{u.name}</div>
                  <div className="text-xs text-muted-foreground">{u.handle} · {u.college || "—"}</div>
                </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">{(u.skills||[]).slice(0,5).map(s=> <span key={s} className="ds-chip-primary">{s}</span>)}</div>
              </div>
            </Link>
            <div className="mt-3 flex items-center gap-2">
              {state.currentUser && (state.currentUser.following || []).includes(u.id) ? (
                <button onClick={()=>unfollow(u.id)} className="h-9 px-3 rounded-xl bg-card border">Unfollow</button>
              ) : (
                <button onClick={()=>follow(u.id)} className="h-9 px-3 rounded-xl bg-primary text-white">Follow</button>
              )}
            </div>
          </div>
        )) : <div className="ds-card p-4 text-sm text-muted-foreground">No builders found. Try different keywords.</div>}
      </div>
    </div>
  );
}

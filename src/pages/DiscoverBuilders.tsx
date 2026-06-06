import { useMemo, useState, useEffect } from "react";
import { useApp } from "@/lib/store";
import { useSearchParams, Link } from "react-router-dom";

export default function DiscoverBuilders() {
  const { state, dispatch } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") || "");
  const [filterSkill, setFilterSkill] = useState("");

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
  }, [users, searchTerms, filterSkill]);

  const follow = (toId: string) => {
    if (!state.currentUser) return;
    dispatch({ type: "follow", payload: { fromId: state.currentUser.id, toId } });
  };
  const unfollow = (toId: string) => {
    if (!state.currentUser) return;
    dispatch({ type: "unfollow", payload: { fromId: state.currentUser.id, toId } });
  };

  const sendRequest = (toId: string) => {
    if (!state.currentUser) return;
    const req = { id: `req_${Date.now()}`, fromId: state.currentUser.id, toId, message: "Hi — I'd like to collaborate on your project", status: "pending", createdAt: new Date().toISOString() } as any;
    dispatch({ type: "sendRequest", payload: req });
  };

  return (
    <div className="container py-10">
      <div className="ds-card p-6 mb-6">
        <h1 className="text-2xl font-semibold">Discover Builders</h1>
        <p className="text-sm text-muted-foreground">Search builders by name, username, skills, or domain.</p>
        <div className="mt-4 flex gap-2">
          <input placeholder="Search builders..." value={q} onChange={(e)=>handleSearchChange(e.target.value)} className="ds-input" />
          <input placeholder="Filter skill (optional)" value={filterSkill} onChange={(e)=>setFilterSkill(e.target.value)} className="ds-input w-48" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.length ? results.map(u => (
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
              <button onClick={()=>sendRequest(u.id)} className="h-9 px-3 rounded-xl bg-card border">Request</button>
            </div>
          </div>
        )) : <div className="ds-card p-4 text-sm text-muted-foreground">No builders found. Try different keywords.</div>}
      </div>
    </div>
  );
}

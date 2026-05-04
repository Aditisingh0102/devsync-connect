import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { Search, MapPin, Sparkles, UserPlus, Users2 } from "lucide-react";
import UserFollowButton from "@/components/UserFollowButton";
import { Link } from "react-router-dom";

const DOMAINS = ["All", "Frontend", "Backend", "Full Stack", "UI/UX", "AI/ML", "DevOps"];

export default function DiscoverBuilders() {
  const { state } = useApp();
  const [q, setQ] = useState("");
  const [domain, setDomain] = useState("All");

  const builders = useMemo(() => {
    const all = Object.values(state.users).filter((u) => !state.currentUser || u.id !== state.currentUser.id);
    return all.filter((u) => {
      if (domain !== "All" && !(u.domains || []).includes(domain)) return false;
      if (!q.trim()) return true;
      const needle = q.toLowerCase();
      return (
        u.name?.toLowerCase().includes(needle) ||
        u.username?.toLowerCase().includes(needle) ||
        (u.skills || []).some((s) => s.toLowerCase().includes(needle)) ||
        (u.domains || []).some((d) => d.toLowerCase().includes(needle)) ||
        (u.roles || []).some((r) => r.toLowerCase().includes(needle))
      );
    });
  }, [state.users, state.currentUser, q, domain]);

  return (
    <div className="container py-10 space-y-6">
      <div className="ds-card p-7 bg-gradient-hero relative overflow-hidden">
        <span className="ds-chip-primary"><Sparkles className="size-3.5" /> Discover builders</span>
        <h1 className="ds-page-title mt-2">Find your next collaborator</h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-xl">Search by name, username, skill, role or domain. Follow builders to see their full activity and send collaboration requests.</p>

        <div className="mt-5 flex flex-col md:flex-row gap-3">
          <div className="flex items-center gap-2 px-3 h-11 flex-1 rounded-xl bg-card border border-border">
            <Search className="size-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by username, skill, role…" className="bg-transparent outline-none text-sm flex-1" />
          </div>
          <select value={domain} onChange={(e) => setDomain(e.target.value)} className="h-11 px-3 rounded-xl bg-card border border-border text-sm">
            {DOMAINS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {builders.length === 0 ? (
        <div className="ds-card p-12 text-center">
          <div className="size-14 rounded-2xl bg-secondary mx-auto flex items-center justify-center mb-3"><Users2 className="size-6 text-muted-foreground" /></div>
          <h3 className="font-semibold">No builders match your search</h3>
          <p className="text-sm text-muted-foreground mt-1">Try a different skill, domain, or username.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {builders.map((u) => {
            const initials = (u.name || "U").split(" ").map((s) => s[0]).slice(0, 2).join("");
            return (
              <div key={u.id} className="ds-card ds-card-hover p-5">
                <div className="flex items-start gap-3">
                  <div className="size-12 rounded-2xl bg-gradient-primary text-white font-semibold flex items-center justify-center shadow-glow shrink-0">{initials}</div>
                  <div className="min-w-0 flex-1">
                    <Link to={`/profile/${u.id}`} className="font-semibold hover:text-primary block truncate">{u.name}</Link>
                    <div className="text-xs text-muted-foreground truncate">@{u.username}</div>
                    {u.college && <div className="text-xs text-muted-foreground mt-0.5 inline-flex items-center gap-1"><MapPin className="size-3" /> {u.college}</div>}
                  </div>
                </div>
                {u.bio && <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{u.bio}</p>}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {(u.skills || []).slice(0, 4).map((s) => <span key={s} className="ds-chip-primary">{s}</span>)}
                </div>
                <div className="flex gap-2 mt-4">
                  <UserFollowButton userId={u.id} />
                  <Link to={`/profile/${u.id}`} className="h-9 px-3 rounded-xl bg-card border border-border text-sm font-medium inline-flex items-center gap-1.5 hover:bg-secondary"><UserPlus className="size-3.5" /> View</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";

export default function DiscoverBuilders() {
  const { state, dispatch } = useApp();
  const [q, setQ] = useState("");
  const [filterSkill, setFilterSkill] = useState("");

  const users = useMemo(() => Object.values(state.users || {}), [state.users]);
  const results = useMemo(() => users.filter(u => {
    if (!u) return false;
    if (!q) return true;
    const s = q.toLowerCase();
    if ((u.name || "").toLowerCase().includes(s)) return true;
    if ((u.username || "").toLowerCase().includes(s)) return true;
    if ((u.handle || "").toLowerCase().includes(s)) return true;
    if ((u.skills || []).join(" ").toLowerCase().includes(s)) return true;
    return false;
  }).filter(u => !filterSkill || (u.skills || []).map(x=>x.toLowerCase()).includes(filterSkill.toLowerCase())), [users, q, filterSkill]);

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
          <input placeholder="Search builders..." value={q} onChange={(e)=>setQ(e.target.value)} className="ds-input" />
          <input placeholder="Filter skill (optional)" value={filterSkill} onChange={(e)=>setFilterSkill(e.target.value)} className="ds-input w-48" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.length ? results.map(u => (
          <div key={u.id} className="ds-card p-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-gradient-primary text-white flex items-center justify-center">{(u.name||"U").split(" ").map((s:any)=>s[0]).slice(0,2).join("")}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between"><div>
                  <div className="font-semibold">{u.name}</div>
                  <div className="text-xs text-muted-foreground">{u.handle} · {u.college || "—"}</div>
                </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">{(u.skills||[]).slice(0,5).map(s=> <span key={s} className="ds-chip-primary">{s}</span>)}</div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              {state.currentUser && (state.currentUser.following || []).includes(u.id) ? (
                <button onClick={()=>unfollow(u.id)} className="h-9 px-3 rounded-xl bg-card border">Unfollow</button>
              ) : (
                <button onClick={()=>follow(u.id)} className="h-9 px-3 rounded-xl bg-primary text-white">Follow</button>
              )}
              <button onClick={()=>sendRequest(u.id)} className="h-9 px-3 rounded-xl bg-card border">Request</button>
              <a href={`/profile/${u.id}`} className="h-9 px-3 rounded-xl bg-card border">View</a>
            </div>
          </div>
        )) : <div className="ds-card p-4 text-sm text-muted-foreground">No builders found. Try different keywords.</div>}
      </div>
    </div>
  );
}

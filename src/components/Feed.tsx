import React, { useMemo, useState } from "react";
import CreatePost from "./CreatePost";
import PostCard from "./PostCard";
import RespondModal from "./RespondModal";
import { useApp, createResponseDraft } from "@/lib/store";

const DOMAINS = ["Frontend","Backend","Full Stack","UI/UX","AI/ML","Data Science","App Development","Cloud","DevOps","Cybersecurity","3D","Infrastructure"];
const ROLES = ["Frontend","Backend","Full Stack","UI/UX","ML","DevOps","Designer","Product"];
const PROJECT_TYPES = ["Prototype","Research","Service","Hackathon","Open Source","Final Year Project","Club"];

export default function Feed() {
  const { state, dispatch } = useApp();
  const [active, setActive] = useState<string | null>(null);
  const [domain, setDomain] = useState<string | "">("");
  const [tech, setTech] = useState<string[]>([]);
  const [role, setRole] = useState<string | "">("");
  const [projectType, setProjectType] = useState<string | "">("");
  const [recentOnly, setRecentOnly] = useState(false);

  const allPosts = useMemo(() => Object.values(state.posts).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)), [state.posts]);

  const filtered = useMemo(() => {
    return allPosts.filter((p) => {
      if (domain && p.domain) {
        const postDomains = Array.isArray(p.domain) ? p.domain : [p.domain];
        if (!postDomains.map(d => d.toLowerCase()).includes(domain.toLowerCase())) return false;
      }
      if (projectType && p.projectType && p.projectType !== projectType) return false;
      if (role && role.length && p.lookingFor && !(Array.isArray(p.lookingFor) ? p.lookingFor : [p.lookingFor]).map((r:string)=>r.toLowerCase()).includes(role.toLowerCase())) return false;
      if (tech.length) {
        const hasTech = tech.every(t => (p.tech||[]).map(x=>x.toLowerCase()).includes(t.toLowerCase()));
        if (!hasTech) return false;
      }
      if (recentOnly) {
        const cutoff = Date.now() - 1000 * 60 * 60 * 24 * 14; // 2 weeks
        if (+new Date(p.createdAt) < cutoff) return false;
      }
      return true;
    });
  }, [allPosts, domain, tech, role, projectType, recentOnly]);

  const onRespond = (post: any) => setActive(post.id);

  const submitResponse = (data: { postId: string; message: string; skills?: string[]; resumeUrl?: string }) => {
    const r = createResponseDraft({ postId: data.postId, message: data.message, skillsSummary: data.skills, resumeUrl: data.resumeUrl });
    dispatch({ type: "createResponse", payload: r });
    setActive(null);
  };

  const toggleTech = (t: string) => setTech((s) => s.includes(t) ? s.filter(x=>x!==t) : [...s, t]);

  return (
    <div>
      <CreatePost />

      <div className="ds-card p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <select aria-label="Filter by domain" value={domain} onChange={(e) => setDomain(e.target.value)} className="h-9 px-3 rounded-md bg-card border">
              <option value="">All Domains</option>
              {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>

            <select aria-label="Filter by project type" value={projectType} onChange={(e)=>setProjectType(e.target.value)} className="h-9 px-3 rounded-md bg-card border">
              <option value="">All Types</option>
              {PROJECT_TYPES.map(pt => <option key={pt} value={pt}>{pt}</option>)}
            </select>

            <select aria-label="Filter by role" value={role} onChange={(e)=>setRole(e.target.value)} className="h-9 px-3 rounded-md bg-card border">
              <option value="">Any Role</option>
              {ROLES.map(r=> <option key={r} value={r}>{r}</option>)}
            </select>

            <div className="hidden md:flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Recent only</label>
              <input aria-label="Show recent only" type="checkbox" checked={recentOnly} onChange={(e)=>setRecentOnly(e.target.checked)} />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap mt-3 md:mt-0">
            <div className="text-sm text-muted-foreground">Tech:</div>
            {Array.from(new Set(allPosts.flatMap(p => p.tech || []))).slice(0, 12).map((t) => (
              <button key={t} onClick={() => toggleTech(t)} className={`px-2 py-1 rounded ${tech.includes(t) ? 'bg-primary text-white' : 'bg-surface-alt border'}`}>{t}</button>
            ))}
            <button onClick={() => { setDomain(""); setTech([]); setRole(""); setProjectType(""); setRecentOnly(false); }} className="ml-2 px-3 py-1 rounded bg-card border">Reset</button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length ? filtered.map((p) => <PostCard key={p.id} post={p} onRespond={onRespond} />) : <div className="ds-card p-4 text-sm text-muted-foreground">No posts match your filters.</div>}
      </div>
      {active && <RespondModal postId={active} open={!!active} onClose={() => setActive(null)} onSubmit={submitResponse} />}
    </div>
  );
}

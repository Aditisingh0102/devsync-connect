import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { projects } from "@/data/mock";
import ProjectCard from "@/components/ProjectCard";

const categories = ["All", "AI", "Web", "Mobile", "DevTools", "Productivity", "Research", "OpenSource", "Education"];
const statuses = ["All", "Recruiting", "In Progress", "Completed"];
const sorts = ["Recommended", "Newest", "Most Members", "Highest Progress"];

export default function FindProjects() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState("Recommended");
  const [page, setPage] = useState(1);
  const perPage = 6;

  const filtered = useMemo(() => {
    let r = projects.filter((p) =>
      (cat === "All" || p.category === cat) &&
      (status === "All" || p.status === status) &&
      (q === "" || p.title.toLowerCase().includes(q.toLowerCase()) || p.tech.some((t) => t.toLowerCase().includes(q.toLowerCase())))
    );
    if (sort === "Most Members") r = [...r].sort((a, b) => b.members - a.members);
    if (sort === "Highest Progress") r = [...r].sort((a, b) => b.progress - a.progress);
    return r;
  }, [q, cat, status, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const slice = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="container py-10">
      <div className="ds-card p-7 mb-6 bg-gradient-hero">
        <h1 className="ds-page-title">Find Projects</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">Discover real-world student projects matched to your skills, interests, and availability.</p>
      </div>

      <div className="ds-card p-4 mb-6 flex flex-col lg:flex-row gap-3">
        <div className="flex-1 flex items-center gap-2 px-3 h-11 rounded-xl bg-secondary border border-border">
          <Search className="size-4 text-muted-foreground" />
          <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search by title or tech…" className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground" />
        </div>
        <Select value={cat} onChange={(v) => { setCat(v); setPage(1); }} options={categories} label="Category" />
        <Select value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={statuses} label="Status" />
        <Select value={sort} onChange={setSort} options={sorts} label="Sort" />
      </div>

      <div className="ds-card p-4 mb-6 flex items-center gap-3 bg-primary-soft border-primary/20">
        <div className="size-10 rounded-xl bg-primary text-white flex items-center justify-center shrink-0"><Sparkles className="size-5" /></div>
        <div className="flex-1">
          <div className="font-semibold text-sm text-foreground">3 high-match projects for you</div>
          <div className="text-xs text-muted-foreground">Based on React, TypeScript, and your team-building history.</div>
        </div>
        <button className="text-sm font-semibold text-primary hover:text-primary-hover">See matches</button>
      </div>

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
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="size-10 rounded-xl bg-card border border-border disabled:opacity-40 flex items-center justify-center"><ChevronLeft className="size-4" /></button>
          {Array.from({ length: pages }).map((_, i) => (
            <button key={i} onClick={() => setPage(i + 1)} className={`size-10 rounded-xl text-sm font-semibold ${page === i + 1 ? "bg-primary text-white" : "bg-card border border-border"}`}>{i + 1}</button>
          ))}
          <button onClick={() => setPage(Math.min(pages, page + 1))} disabled={page === pages} className="size-10 rounded-xl bg-card border border-border disabled:opacity-40 flex items-center justify-center"><ChevronRight className="size-4" /></button>
        </div>
      )}
    </div>
  );
}

function Select({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: string[]; label: string }) {
  return (
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-11 pl-3 pr-9 rounded-xl bg-secondary border border-border text-sm font-medium appearance-none cursor-pointer outline-none focus:border-primary min-w-[140px]">
        {options.map((o) => <option key={o} value={o}>{label}: {o}</option>)}
      </select>
      <ChevronRight className="size-4 absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none text-muted-foreground" />
    </div>
  );
}

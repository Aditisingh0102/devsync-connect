import { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, GraduationCap, Sparkles, User, Briefcase, ListChecks } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { skills } from "@/data/mock";

const steps = [
  { icon: GraduationCap, title: "College Login", desc: "Sign in with your verified college ERP." },
  { icon: User, title: "Skills & Interests", desc: "Tell us what you build and what you want to learn." },
  { icon: GraduationCap, title: "Academic Details", desc: "Year, branch, and a short bio." },
  { icon: Briefcase, title: "Roles & Domains", desc: "Pick the roles and domains that excite you." },
  { icon: ListChecks, title: "Review & Finish", desc: "All set — let's sync." },
];

const roles = ["Frontend", "Backend", "Full Stack", "Designer", "ML Engineer", "PM", "DevOps", "Mobile"];
const domains = ["AI", "Web", "Mobile", "EdTech", "Hackathons", "OpenSource", "DevTools"];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ erp: "", name: "", year: "", bio: "", skills: [] as string[], roles: [] as string[], domains: [] as string[] });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const toggle = (key: "skills" | "roles" | "domains", v: string) => {
    setData({ ...data, [key]: data[key].includes(v) ? data[key].filter((x) => x !== v) : [...data[key], v] });
  };

  const next = () => {
    const e: Record<string, string> = {};
    if (step === 0 && data.erp.length < 3) e.erp = "Enter your ERP / college ID";
    if (step === 1 && data.skills.length < 3) e.skills = "Pick at least 3 skills";
    if (step === 2 && !data.year) e.year = "Select your year";
    setErrors(e);
    if (Object.keys(e).length) return;
    if (step === steps.length - 1) navigate("/");
    else setStep(step + 1);
  };

  return (
    <div className="container py-12 max-w-3xl">
      <div className="ds-card p-7 bg-gradient-hero mb-6">
        <span className="ds-chip-primary"><Sparkles className="size-3.5" /> Onboarding</span>
        <h1 className="ds-page-title mt-2">Set up your DevSync profile</h1>
        <p className="text-muted-foreground mt-1">A few quick steps to start matching with great teams.</p>

        <div className="mt-6 flex items-center gap-2">
          {steps.map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-secondary"}`} />
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-2">Step {step + 1} of {steps.length}</p>
      </div>

      <div className="ds-card p-7">
        <div className="flex items-center gap-3 mb-6">
          <div className="size-11 rounded-xl bg-gradient-primary text-white flex items-center justify-center shadow-glow">
            {(() => { const I = steps[step].icon; return <I className="size-5" />; })()}
          </div>
          <div><h2 className="font-semibold text-lg">{steps[step].title}</h2><p className="text-sm text-muted-foreground">{steps[step].desc}</p></div>
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <Field label="ERP / College ID" error={errors.erp}>
              <input value={data.erp} onChange={(e) => setData({ ...data, erp: e.target.value })} placeholder="e.g. 2022CSE001" className="ds-input" />
            </Field>
            <Field label="Full name">
              <input value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} placeholder="Your full name" className="ds-input" />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div>
            <p className="text-sm font-medium mb-3">Pick your skills <span className="text-muted-foreground">({data.skills.length})</span></p>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <button key={s} onClick={() => toggle("skills", s)} className={`px-3.5 h-9 rounded-full text-sm font-medium transition-all border ${data.skills.includes(s) ? "bg-primary text-white border-primary" : "bg-card border-border hover:border-primary"}`}>{s}</button>
              ))}
            </div>
            {errors.skills && <p className="text-xs text-danger mt-3">{errors.skills}</p>}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Field label="Academic Year" error={errors.year}>
              <select value={data.year} onChange={(e) => setData({ ...data, year: e.target.value })} className="ds-input">
                <option value="">Select year</option>{["1", "2", "3", "4"].map((y) => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </Field>
            <Field label="Bio">
              <textarea value={data.bio} onChange={(e) => setData({ ...data, bio: e.target.value })} rows={4} placeholder="Tell teams what you love to build…" className="ds-input resize-none" />
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium mb-3">Preferred Roles</p>
              <div className="flex flex-wrap gap-2">
                {roles.map((r) => (
                  <button key={r} onClick={() => toggle("roles", r)} className={`px-3.5 h-9 rounded-full text-sm font-medium border ${data.roles.includes(r) ? "bg-primary text-white border-primary" : "bg-card border-border hover:border-primary"}`}>{r}</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-3">Domains</p>
              <div className="flex flex-wrap gap-2">
                {domains.map((d) => (
                  <button key={d} onClick={() => toggle("domains", d)} className={`px-3.5 h-9 rounded-full text-sm font-medium border ${data.domains.includes(d) ? "bg-primary text-white border-primary" : "bg-card border-border hover:border-primary"}`}>{d}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-3">
            {[
              ["ID", data.erp || "—"], ["Name", data.name || "—"], ["Year", data.year ? `Year ${data.year}` : "—"],
              ["Skills", data.skills.join(", ") || "—"], ["Roles", data.roles.join(", ") || "—"], ["Domains", data.domains.join(", ") || "—"],
            ].map(([k, v]) => (
              <div key={k as string} className="flex items-start justify-between p-3 rounded-xl bg-surface-alt border border-border gap-4">
                <span className="text-sm text-muted-foreground">{k}</span><span className="text-sm font-medium text-right">{v}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 p-3 rounded-xl bg-success-bg text-success text-sm"><CheckCircle2 className="size-4" /> Looks great. Ready to sync!</div>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="h-11 px-5 rounded-xl bg-card border border-border text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-40">
            <ArrowLeft className="size-4" /> Back
          </button>
          <button onClick={next} className="h-11 px-6 rounded-xl bg-primary text-white text-sm font-semibold inline-flex items-center gap-2 hover:bg-primary-hover">
            {step === steps.length - 1 ? "Finish" : "Continue"} <ArrowRight className="size-4" />
          </button>
        </div>
      </div>

      <style>{`.ds-input { width: 100%; height: 2.75rem; padding: 0 0.875rem; border-radius: 0.75rem; background: hsl(var(--secondary)); border: 1px solid hsl(var(--border)); font-size: 0.875rem; outline: none; transition: border-color 0.15s; } .ds-input:focus { border-color: hsl(var(--primary)); } textarea.ds-input { padding: 0.75rem 0.875rem; height: auto; }`}</style>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-sm font-medium mb-1.5 block">{label}</label>
      {children}
      {error && <p className="text-xs text-danger mt-1.5">{error}</p>}
    </div>
  );
}

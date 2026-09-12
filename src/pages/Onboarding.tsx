import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, GraduationCap, Sparkles, User, Briefcase, ListChecks } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { skills } from "@/data/mock";
import { useApp } from "@/lib/store";

const steps = [
  { icon: GraduationCap, title: "Email Verification", desc: "Use your email to begin setting up your profile. College verification will be added later." },
  { icon: User, title: "Skills & Interests", desc: "Tell us what you build and what you want to learn." },
  { icon: GraduationCap, title: "Academic Details", desc: "Year, branch, and a short bio." },
  { icon: ListChecks, title: "Review & Finish", desc: "All set — let's sync." },
];

const roles = ["Frontend", "Backend", "Full Stack", "Designer", "ML Engineer", "PM", "DevOps", "Mobile"];
const domains = ["AI", "Web", "Mobile", "EdTech", "Hackathons", "OpenSource", "DevTools"];
const RECOMMENDED_SKILLS = ["Next.js", "Tailwind", "Supabase", "PostgreSQL", "MongoDB", "FastAPI", "Django", "Docker", "Figma", "Git"];

type OnboardingFormData = {
  email: string;
  name: string;
  year: string;
  college: string;
  bio: string;
  skills: string[];
  roles: string[];
  domains: string[];
};

export default function Onboarding() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingFormData>({ email: "", name: "", year: "", college: "", bio: "", skills: [], roles: [], domains: [] });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (state.currentUser) {
      setData((prev) => ({
        ...prev,
        email: prev.email || state.currentUser?.email || "",
        name: prev.name || state.currentUser?.name || "",
        college: prev.college || state.currentUser?.college || "",
      }));
    }
  }, [state.currentUser]);

  const [localSkills, setLocalSkills] = useState<string[]>(skills);
  const [customSkill, setCustomSkill] = useState("");

  const handleAddSkill = () => {
    const trimmed = customSkill.trim();
    if (!trimmed) return;
    if (!localSkills.includes(trimmed)) {
      setLocalSkills([...localSkills, trimmed]);
    }
    if (!data.skills.includes(trimmed)) {
      setData({ ...data, skills: [...data.skills, trimmed] });
    }
    setCustomSkill("");
  };

  const toggle = (key: "skills" | "roles" | "domains", v: string) => {
    setData({ ...data, [key]: data[key].includes(v) ? data[key].filter((x) => x !== v) : [...data[key], v] });
  };

  const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const existingUser = state.currentUser;

  if (existingUser?.profileCompleted) {
    return (
      <div className="container py-12 max-w-3xl">
        <div className="ds-card p-7 bg-gradient-hero text-center">
          <span className="ds-chip-primary"><Sparkles className="size-3.5" /> Onboarding</span>
          <h1 className="ds-page-title mt-3">You're already signed in and your profile is set up</h1>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">Your profile data is already saved. Go to the dashboard or profile to continue collaborating.</p>
          <div className="mt-6 flex justify-center gap-3 flex-wrap">
            <button onClick={() => navigate("/dashboard")} className="h-11 px-5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary-hover">Go to Dashboard</button>
            <button onClick={() => navigate("/profile")} className="h-11 px-5 rounded-xl bg-card border border-border text-sm font-semibold hover:bg-secondary">Open Profile</button>
          </div>
        </div>
      </div>
    );
  }

  const next = () => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!data.name.trim()) e.name = "Enter your full name";
      if (!data.email.trim()) e.email = "Enter your email address";
      else if (!isValidEmail(data.email.trim())) e.email = "Enter a valid email address";
    }
    if (step === 1 && data.skills.length < 3) e.skills = "Pick at least 3 skills";
    if (step === 2) {
      if (!data.college.trim()) e.college = "Enter your college/university name";
      if (!data.year) e.year = "Select your year";
      if (!data.bio.trim()) e.bio = "Enter your short bio";
    }
    setErrors(e);
    if (Object.keys(e).length) return;
    if (step === steps.length - 1) {
      const existingUser = state.currentUser;
      const username = existingUser?.username || (data.name
        ? `${data.name.split(" ")[0].toLowerCase()}_${Date.now().toString().slice(-5)}`
        : `user_${Date.now()}`);
      const handle = existingUser?.handle || (data.name ? `@${data.name.split(" ")[0].toLowerCase()}` : `@${username}`);

      const user = {
        ...existingUser,
        id: existingUser?.id || `u_${Date.now()}`,
        name: data.name,
        username,
        handle,
        avatar: existingUser?.avatar || (data.name ? data.name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase() : "AC"),
        email: data.email,
        bio: data.bio,
        college: data.college.trim(),
        year: data.year ? `Year ${data.year}` : existingUser?.year,
        skills: data.skills,
        roles: data.roles,
        domains: data.domains,
        followers: existingUser?.followers || [],
        following: existingUser?.following || [],
        pendingRequests: existingUser?.pendingRequests || [],
        sentRequests: existingUser?.sentRequests || [],
        profileCompleted: true,
        links: existingUser?.links || { github: "", linkedin: "", portfolio: "" },
      } as any;
      dispatch({ type: "setCurrentUser", payload: user });
      navigate("/dashboard", { state: { isNewSignup: true } });
    } else setStep(step + 1);
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
            <Field label="Email Address" error={errors.email}>
              <input value={data.email} disabled className="ds-input bg-secondary cursor-not-allowed text-muted-foreground" />
            </Field>
            <Field label="Full Name" error={errors.name}>
              <input value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} placeholder="Your full name" className="ds-input" autoComplete="off" />
            </Field>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-3">Pick your skills <span className="text-muted-foreground">({data.skills.length})</span></p>
              <div className="flex flex-wrap gap-2">
                {localSkills.map((s) => (
                  <button key={s} onClick={() => toggle("skills", s)} className={`px-3.5 h-9 rounded-full text-sm font-medium transition-all border ${data.skills.includes(s) ? "bg-primary text-white border-primary" : "bg-card border-border hover:border-primary"}`}>{s}</button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-border/50">
              <label className="text-sm font-medium mb-1.5 block">Add a custom skill</label>
              <div className="flex gap-2 max-w-md">
                <input
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="e.g. Next.js, Rust, Docker"
                  className="ds-input flex-1"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="h-11 px-5 rounded-xl bg-secondary hover:bg-card border border-border text-sm font-semibold transition-all shrink-0"
                >
                  Add Skill
                </button>
              </div>
            </div>

            {/* Recommended Skills */}
            <div className="pt-2">
              <p className="text-xs font-medium text-muted-foreground mb-2">Recommended: Click to add</p>
              <div className="flex flex-wrap gap-1.5">
                {RECOMMENDED_SKILLS.filter(s => !localSkills.includes(s)).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      if (!localSkills.includes(s)) {
                        setLocalSkills([...localSkills, s]);
                      }
                      if (!data.skills.includes(s)) {
                        setData({ ...data, skills: [...data.skills, s] });
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs bg-secondary hover:bg-card border border-border text-muted-foreground hover:text-foreground transition-all"
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>
            {errors.skills && <p className="text-xs text-danger mt-1">{errors.skills}</p>}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <Field label="College / University" error={errors.college}>
              <input value={data.college} onChange={(e) => setData({ ...data, college: e.target.value })} placeholder="e.g. State University" className="ds-input" autoComplete="off" />
            </Field>
            <Field label="Academic Year" error={errors.year}>
              <select aria-label="Academic Year" value={data.year} onChange={(e) => setData({ ...data, year: e.target.value })} className="ds-input">
                <option value="">Select year</option>{["1", "2", "3", "4"].map((y) => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </Field>
            <Field label="Bio" error={errors.bio}>
              <textarea value={data.bio} onChange={(e) => setData({ ...data, bio: e.target.value })} rows={4} placeholder="Tell teams what you love to build…" className="ds-input resize-none" />
            </Field>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            {[
              ["Email", data.email || "—"], ["Name", data.name || "—"], ["College", data.college || "—"], ["Year", data.year ? `Year ${data.year}` : "—"],
              ["Skills", data.skills.join(", ") || "—"],
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

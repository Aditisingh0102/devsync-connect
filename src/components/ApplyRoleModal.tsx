import React, { useState, useRef } from "react";
import { X, FileText, Upload, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApplyRoleModalProps {
  open: boolean;
  onClose: () => void;
  projectName: string;
  role: string;
  onSubmit: (data: { message: string; skills: string[]; resume: string; resumeName: string }) => void;
}

export default function ApplyRoleModal({ open, onClose, projectName, role, onSubmit }: ApplyRoleModalProps) {
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [skills, setSkills] = useState("");
  const [resumeData, setResumeData] = useState<string | null>(null);
  const [resumeName, setResumeName] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setError("File size exceeds 2MB limit.");
      toast({
        title: "File Too Large",
        description: "Please upload a resume smaller than 2MB.",
        variant: "destructive",
      });
      return;
    }

    setError(null);
    setResumeName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setResumeData(String(reader.result || ""));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      setError("Please write a short cover note.");
      return;
    }

    if (!resumeData) {
      setError("Resume upload is required.");
      toast({
        title: "Resume Required",
        description: "Please upload your resume to apply for this role.",
        variant: "destructive",
      });
      return;
    }

    onSubmit({
      message: message.trim(),
      skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      resume: resumeData,
      resumeName: resumeName,
    });

    // Reset fields
    setMessage("");
    setSkills("");
    setResumeData(null);
    setResumeName("");
    setError(null);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="ds-card p-6 z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground size-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
          aria-label="Close modal"
        >
          <X className="size-5" />
        </button>

        <div className="mb-6 pr-6">
          <h3 className="text-lg font-bold text-foreground">Apply as {role}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Project: <span className="font-semibold text-primary">{projectName}</span></p>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-danger/10 text-danger border border-danger/10 text-xs flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cover Note */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Why are you a good fit? <span className="text-primary">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell the project owner about your experience, interests, or availability..."
              className="ds-input resize-none min-h-[100px]"
              rows={4}
              required
            />
          </div>

          {/* Relevant Skills */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
              Relevant Skills / Tech Stack
            </label>

            {/* Current Skills as Tags */}
            <div className="flex flex-wrap gap-2 p-3 bg-secondary/30 border border-border rounded-xl min-h-[50px]">
              {skills.split(",").map((s) => s.trim()).filter(Boolean).length > 0 ? (
                skills.split(",").map((s) => s.trim()).filter(Boolean).map((s) => (
                  <span key={s} className="ds-chip-primary flex items-center gap-1 py-1 px-2.5 text-xs font-semibold">
                    {s}
                    <button
                      type="button"
                      onClick={() => {
                        const current = skills.split(",").map((x) => x.trim()).filter(Boolean);
                        setSkills(current.filter((x) => x !== s).join(", "));
                      }}
                      className="hover:text-danger-hover focus:outline-none ml-1 size-3.5 rounded-full inline-flex items-center justify-center hover:bg-secondary/40 text-muted-foreground text-sm font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-xs text-muted-foreground select-none">No skills added yet.</span>
              )}
            </div>

            {/* Input to type/add and Select from popular skills */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex gap-2">
                <input
                  id="modal-skill-input"
                  placeholder="Type a skill..."
                  className="ds-input flex-1"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const input = e.currentTarget;
                      const val = input.value.trim();
                      if (val) {
                        const current = skills.split(",").map((x) => x.trim()).filter(Boolean);
                        if (!current.includes(val)) {
                          setSkills([...current, val].join(", "));
                        }
                        input.value = "";
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById("modal-skill-input") as HTMLInputElement;
                    const val = input?.value.trim();
                    if (val) {
                      const current = skills.split(",").map((x) => x.trim()).filter(Boolean);
                      if (!current.includes(val)) {
                        setSkills([...current, val].join(", "));
                      }
                      input.value = "";
                    }
                  }}
                  className="h-11 px-4 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover shrink-0"
                >
                  Add
                </button>
              </div>

              {/* Dropdown Menu select */}
              <select
                aria-label="Select popular skill"
                value=""
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    const current = skills.split(",").map((x) => x.trim()).filter(Boolean);
                    if (!current.includes(val)) {
                      setSkills([...current, val].join(", "));
                    }
                  }
                  e.target.value = ""; // reset dropdown selection
                }}
                className="h-11 px-3 rounded-xl bg-secondary border border-border text-sm font-medium cursor-pointer outline-none focus:border-primary sm:w-48"
              >
                <option value="">-- Choose popular skill --</option>
                {["React", "TypeScript", "Python", "Node.js", "UI/UX", "ML", "DevOps", "Mobile", "Data", "Cloud", "Next.js", "Tailwind", "Supabase", "PostgreSQL", "Figma", "Docker", "Git", "FastAPI", "Django", "Vue", "Express"].map((s) => {
                  const current = skills.split(",").map((x) => x.trim()).filter(Boolean);
                  const isAdded = current.includes(s);
                  return (
                    <option key={s} value={s} disabled={isAdded}>
                      {s} {isAdded ? "(Added)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Resume Upload Field */}
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Upload Resume (PDF, Word, or Image) <span className="text-primary">*</span>
            </label>
            <div className="flex flex-col gap-2">
              <label className="border border-dashed border-border/80 hover:border-primary/50 bg-card hover:bg-secondary rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className="size-10 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Upload className="size-5" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  {resumeName ? "Change uploaded file" : "Upload your resume"}
                </span>
                <span className="text-xs text-muted-foreground">Max file size: 2MB</span>
              </label>

              {resumeName && (
                <div className="p-3 rounded-xl bg-primary-soft text-primary border border-primary/10 flex items-center gap-2 text-xs">
                  <FileText className="size-4 shrink-0" />
                  <span className="font-semibold truncate flex-1">{resumeName}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setResumeData(null);
                      setResumeName("");
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="font-bold hover:text-primary-hover text-[14px] ml-1.5"
                    aria-label="Remove resume"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
            <button
              type="button"
              onClick={onClose}
              className="h-11 px-6 rounded-xl bg-card border border-border text-sm font-semibold text-foreground hover:bg-secondary transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-11 px-6 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover shadow-glow transition-all"
            >
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

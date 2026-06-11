import React, { useState, useMemo } from "react";
import { useApp, createPostDraft } from "@/lib/store";
import { PostType } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { X, Link as LinkIcon, Image as ImageIcon, Globe, Lock, Users } from "lucide-react";

const DOMAINS = [
  "Frontend",
  "Backend",
  "Full Stack",
  "UI/UX",
  "AI/ML",
  "Data Science",
  "App Development",
  "Cloud",
  "DevOps",
  "Cybersecurity",
  "3D",
  "Infrastructure"
];

const PROJECT_TYPES = [
  "Hackathon",
  "Open Source",
  "Final Year Project",
  "Prototype",
  "Research",
  "Service",
  "Club"
];

const ROLES = [
  "Frontend",
  "Backend",
  "Full Stack",
  "UI/UX",
  "ML",
  "DevOps",
  "Designer",
  "Product",
  "Mobile Dev",
  "Researcher"
];

const AVAILABLE_TECH = [
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
  "Angular",
  "HTML",
  "CSS",
  "Express",
  "Go",
  "Rust"
];

const POST_TYPES: PostType[] = [
  "Looking for Team",
  "Seeking Contributor",
  "Open to Join",
  "Project Update",
  "Hiring for Hackathon",
  "Final Year Project Need",
  "Open Source Collaboration",
  "Resource Share",
];

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreatePostModal({ open, onClose }: CreatePostModalProps) {
  const { state, dispatch } = useApp();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [type, setType] = useState<PostType>("Looking for Team");
  const [projectName, setProjectName] = useState("");
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [customDomain, setCustomDomain] = useState("");
  const [showCustomDomainInput, setShowCustomDomainInput] = useState(false);
  const [selectedTech, setSelectedTech] = useState<string[]>([]);
  const [customTech, setCustomTech] = useState("");
  const [showCustomTechInput, setShowCustomTechInput] = useState(false);
  const [projectType, setProjectType] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [referenceLink, setReferenceLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private" | "friends">("public");

  const handleSelectDomain = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "custom") {
      setShowCustomDomainInput(true);
      e.target.value = "";
      return;
    }
    if (val && !selectedDomains.includes(val)) {
      setSelectedDomains([...selectedDomains, val]);
    }
    e.target.value = "";
  };

  const removeDomain = (d: string) => {
    setSelectedDomains(selectedDomains.filter((x) => x !== d));
  };

  const handleSelectTech = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === "custom") {
      setShowCustomTechInput(true);
      e.target.value = "";
      return;
    }
    if (val && !selectedTech.includes(val)) {
      setSelectedTech([...selectedTech, val]);
    }
    e.target.value = "";
  };

  const removeTech = (t: string) => {
    setSelectedTech(selectedTech.filter((x) => x !== t));
  };

  const handleSelectRole = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val && !selectedRoles.includes(val)) {
      setSelectedRoles([...selectedRoles, val]);
    }
    e.target.value = "";
  };

  const removeRole = (r: string) => {
    setSelectedRoles(selectedRoles.filter((x) => x !== r));
  };

  if (!open) return null;

  const handleImage = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageUrl(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please log in to post a new project collaboration.",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Validation Error",
        description: "Post title or headline is required.",
        variant: "destructive",
      });
      return;
    }

    if (!body.trim()) {
      toast({
        title: "Validation Error",
        description: "Basic details/description are required.",
        variant: "destructive",
      });
      return;
    }

    const p = createPostDraft({
      authorId: state.currentUser.id,
      title: title.trim(),
      body: body.trim(),
      type,
      projectName: projectName.trim() || undefined,
      domain: selectedDomains.length > 0 ? selectedDomains : undefined,
      tech: selectedTech,
      projectType: projectType || undefined,
      lookingFor: selectedRoles.length > 0 ? selectedRoles : undefined,
      referenceLink: referenceLink.trim() || undefined,
      imageUrl: imageUrl || undefined,
      visibility,
    });

    dispatch({ type: "createPost", payload: p });

    toast({
      title: "Success!",
      description: "Your project collaboration post is now live.",
    });

    // Reset Form
    setTitle("");
    setBody("");
    setType("Looking for Team");
    setProjectName("");
    setSelectedDomains([]);
    setSelectedTech([]);
    setProjectType("");
    setSelectedRoles([]);
    setReferenceLink("");
    setImageUrl("");
    setVisibility("public");

    onClose();
    navigate("/feed");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="ds-card p-6 z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted-foreground hover:text-foreground size-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors"
          aria-label="Close modal"
        >
          <X className="size-5" />
        </button>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6 pr-10">
          <div>
            <h3 className="text-xl font-bold text-foreground mb-1">Post a New Project</h3>
            <p className="text-sm text-muted-foreground">
              Find student builders, partners, or hackathon teammates by creating a collaboration post.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-1.5 px-3 h-10 rounded-xl bg-secondary border border-border text-xs font-semibold text-muted-foreground self-start md:self-auto">
            {visibility === "public" && <Globe className="size-3.5 text-primary" />}
            {visibility === "private" && <Lock className="size-3.5 text-danger" />}
            {visibility === "friends" && <Users className="size-3.5 text-success" />}
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as any)}
              className="bg-transparent border-none outline-none cursor-pointer text-foreground font-semibold pr-1"
              aria-label="Select Visibility"
            >
              <option value="public" className="bg-background text-foreground">Public</option>
              <option value="private" className="bg-background text-foreground">Private</option>
              <option value="friends" className="bg-background text-foreground">Friend</option>
            </select>
          </div>
        </div>

        {!state.currentUser ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">You must be logged in to create a post.</p>
            <button
              onClick={() => {
                onClose();
                navigate("/login");
              }}
              className="h-11 px-6 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover transition-all"
            >
              Go to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title / Headline */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Post Title / Headline <span className="text-primary">*</span>
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Seeking React Native Dev for Campus Events App"
                className="ds-input"
                required
              />
            </div>

            {/* Grid for Name & Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Project Name
                </label>
                <input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g., Campus Connect"
                  className="ds-input"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Project Type
                </label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="ds-input appearance-none"
                  aria-label="Select Project Type"
                >
                  <option value="">Select Project Type (e.g. Hackathon)</option>
                  {PROJECT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Basic Details / Body */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                Basic Details / Description <span className="text-primary">*</span>
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Describe what your project is about, its objectives, and what you hope to achieve..."
                className="ds-input resize-none min-h-[100px]"
                rows={4}
                required
              />
            </div>

            {/* Grid for Domains and Post Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Domains Required
                </label>
                <select
                  onChange={handleSelectDomain}
                  className="ds-input appearance-none"
                  aria-label="Select Domain"
                  defaultValue=""
                >
                  <option value="">Select Domain (e.g. AI/ML)</option>
                  {DOMAINS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                  <option value="custom" className="text-primary font-semibold">+ Add Custom Domain...</option>
                </select>

                {showCustomDomainInput && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      placeholder="Enter custom domain..."
                      className="ds-input flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (customDomain.trim() && !selectedDomains.includes(customDomain.trim())) {
                            setSelectedDomains([...selectedDomains, customDomain.trim()]);
                          }
                          setCustomDomain("");
                          setShowCustomDomainInput(false);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customDomain.trim() && !selectedDomains.includes(customDomain.trim())) {
                          setSelectedDomains([...selectedDomains, customDomain.trim()]);
                        }
                        setCustomDomain("");
                        setShowCustomDomainInput(false);
                      }}
                      className="h-11 px-4 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover shadow-glow"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomDomain("");
                        setShowCustomDomainInput(false);
                      }}
                      className="h-11 px-4 rounded-xl bg-card border border-border text-sm font-semibold text-foreground hover:bg-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Selected domains tags */}
                {selectedDomains.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedDomains.map((d) => (
                      <span
                        key={d}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
                      >
                        {d}
                        <button
                          type="button"
                          onClick={() => removeDomain(d)}
                          className="hover:text-primary-hover font-bold text-[11px] ml-0.5"
                          aria-label={`Remove domain ${d}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Post Collaboration Type
                </label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as PostType)}
                  className="ds-input"
                  aria-label="Select Post Type"
                >
                  {POST_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tech Stack and Looking For */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Tech Stack / Skills
                </label>
                <select
                  onChange={handleSelectTech}
                  className="ds-input appearance-none"
                  aria-label="Select Tech"
                  defaultValue=""
                >
                  <option value="">Select Tech (e.g. React)</option>
                  {AVAILABLE_TECH.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                  <option value="custom" className="text-primary font-semibold">+ Add Custom Tech...</option>
                </select>

                {showCustomTechInput && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={customTech}
                      onChange={(e) => setCustomTech(e.target.value)}
                      placeholder="Enter custom tech..."
                      className="ds-input flex-1"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (customTech.trim() && !selectedTech.includes(customTech.trim())) {
                            setSelectedTech([...selectedTech, customTech.trim()]);
                          }
                          setCustomTech("");
                          setShowCustomTechInput(false);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customTech.trim() && !selectedTech.includes(customTech.trim())) {
                          setSelectedTech([...selectedTech, customTech.trim()]);
                        }
                        setCustomTech("");
                        setShowCustomTechInput(false);
                      }}
                      className="h-11 px-4 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover shadow-glow"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomTech("");
                        setShowCustomTechInput(false);
                      }}
                      className="h-11 px-4 rounded-xl bg-card border border-border text-sm font-semibold text-foreground hover:bg-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Selected tech tags */}
                {selectedTech.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedTech.map((t) => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
                      >
                        {t}
                        <button
                          type="button"
                          onClick={() => removeTech(t)}
                          className="hover:text-primary-hover font-bold text-[11px] ml-0.5"
                          aria-label={`Remove tech ${t}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Looking For (Roles/Skills)
                </label>
                <select
                  onChange={handleSelectRole}
                  className="ds-input appearance-none"
                  aria-label="Select Role"
                  defaultValue=""
                >
                  <option value="">Select Role/Skill (e.g. Frontend)</option>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                {/* Selected roles tags */}
                {selectedRoles.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selectedRoles.map((r) => (
                      <span
                        key={r}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
                      >
                        {r}
                        <button
                          type="button"
                          onClick={() => removeRole(r)}
                          className="hover:text-primary-hover font-bold text-[11px] ml-0.5"
                          aria-label={`Remove role ${r}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Optional Links and Image */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Reference Link (optional)
                </label>
                <div className="relative flex items-center">
                  <LinkIcon className="size-4 text-muted-foreground absolute left-3 pointer-events-none" />
                  <input
                    value={referenceLink}
                    onChange={(e) => setReferenceLink(e.target.value)}
                    placeholder="e.g. https://github.com/your-project"
                    className="ds-input pl-10"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Project Image Preview (optional)
                </label>
                <label className="h-11 px-4 rounded-xl bg-card border border-border text-sm font-medium inline-flex items-center gap-2 cursor-pointer hover:bg-secondary w-full transition-all">
                  <ImageIcon className="size-4 text-muted-foreground" />
                  <span className="truncate flex-1 text-muted-foreground text-left">
                    {imageUrl ? "Image attached" : "Upload project image"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImage(e.target.files?.[0])}
                  />
                </label>
              </div>
            </div>

            {/* Image Preview Window */}
            {imageUrl && (
              <div className="rounded-xl overflow-hidden border border-border bg-surface-alt relative mt-2 max-h-48 group">
                <img src={imageUrl} alt="Project Preview" className="w-full h-full object-cover max-h-48" />
                <button
                  type="button"
                  onClick={() => setImageUrl("")}
                  className="absolute right-2 top-2 bg-black/75 hover:bg-black text-white p-1 rounded-full hover:scale-105 transition-transform"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}

            {/* Footer Buttons */}
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
                Publish Post
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

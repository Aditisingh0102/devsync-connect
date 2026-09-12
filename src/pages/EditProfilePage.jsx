import React, { useEffect, useState, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { X, Plus, ArrowLeft } from "lucide-react";

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

export default function EditProfilePage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const { toast } = useToast();
  const currentUser = state.currentUser;

  // State definitions
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [college, setCollege] = useState("");
  const [year, setYear] = useState("Year 1");

  // Tag fields
  const [skills, setSkills] = useState([]);
  const [domains, setDomains] = useState([]);
  const [roles, setRoles] = useState([]);

  // Inputs for tags
  const [skillInput, setSkillInput] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const skillsContainerRef = useRef(null);

  // Links
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");

  // Pre-fill fields on mount
  useEffect(() => {
    if (!currentUser) return;
    setName(currentUser.name || "");
    setUsername((currentUser.username || currentUser.handle || "").replace(/[@\s]/g, ""));
    setBio(currentUser.bio || "");
    setCollege(currentUser.college || "");
    setYear(currentUser.year || "Year 3"); // default to Year 3 if not specified
    setSkills(currentUser.skills || []);
    setDomains(currentUser.domains || []);
    setRoles(currentUser.roles || []);
    setGithub(currentUser.links?.github || "");
    setLinkedin(currentUser.links?.linkedin || "");
    setPortfolio(currentUser.links?.portfolio || "");
  }, [currentUser]);

  // Click outside dropdown handler
  useEffect(() => {
    function handleClickOutside(event) {
      if (skillsContainerRef.current && !skillsContainerRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSkills = useMemo(() => {
    const remaining = AVAILABLE_SKILLS.filter(
      (s) => !skills.some((selected) => selected.toLowerCase() === s.toLowerCase())
    );
    if (!skillInput) return remaining;
    return remaining.filter((s) => s.toLowerCase().includes(skillInput.toLowerCase()));
  }, [skillInput, skills]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background py-10 flex items-center justify-center transition-colors">
        <div className="bg-card border border-border rounded-2xl p-6 text-center max-w-md shadow-sm">
          <p className="text-muted-foreground">No active session found. Please log in first.</p>
        </div>
      </div>
    );
  }

  const handleUsernameChange = (val) => {
    const sanitized = val
      .replace(/[@\s]/g, "")
      .replace(/[^a-zA-Z0-9_.-]/g, "")
      .toLowerCase();
    setUsername(sanitized);
  };

  // Tag Add Helpers
  const addSkill = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      if (!skills.includes(skillInput.trim())) {
        setSkills([...skills, skillInput.trim()]);
      }
      setSkillInput("");
      setDropdownOpen(false);
    }
  };

  const removeSkill = (indexToRemove) => {
    setSkills(skills.filter((_, idx) => idx !== indexToRemove));
  };

  // URL Validator helper
  const isValidUrl = (str) => {
    if (!str || str.trim() === "" || str === "#") return true;
    try {
      const urlToTest = str.startsWith("http://") || str.startsWith("https://") ? str : "https://" + str;
      new URL(urlToTest);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSave = async () => {
    // Validation
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Full name is required.",
        variant: "destructive",
      });
      return;
    }

    if (!username.trim()) {
      toast({
        title: "Validation Error",
        description: "Username is required.",
        variant: "destructive",
      });
      return;
    }

    // Validate URLs
    if (!isValidUrl(github)) {
      toast({
        title: "Invalid URL",
        description: "GitHub link must be a valid URL.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidUrl(linkedin)) {
      toast({
        title: "Invalid URL",
        description: "LinkedIn link must be a valid URL.",
        variant: "destructive",
      });
      return;
    }

    if (!isValidUrl(portfolio)) {
      toast({
        title: "Invalid URL",
        description: "Portfolio link must be a valid URL.",
        variant: "destructive",
      });
      return;
    }

    // Prepare updated user object
    const updatedUser = {
      ...currentUser,
      avatar: currentUser.avatar,
      name: name.trim(),
      username: username.trim(),
      handle: `@${username.trim().toLowerCase()}`,
      bio: bio.trim(),
      college: college.trim(),
      year,
      skills,
      domains,
      roles,
      links: {
        github: (github || "").trim(),
        linkedin: (linkedin || "").trim(),
        portfolio: (portfolio || "").trim(),
      },
    };

    try {
      import('@/lib/api').then(async ({ api }) => {
        await api.updateMe({
          name: name.trim(),
          bio: bio.trim(),
          college: college.trim(),
          year: year,
          skills: skills,
          domains: domains
        });
      }).catch(console.error);
    } catch(e) {
      console.error(e);
    }

    dispatch({
      type: "updateUser",
      payload: updatedUser,
    });

    dispatch({
      type: "setCurrentUser",
      payload: updatedUser,
    });

    toast({
      title: "Profile Saved",
      description: "Your public profile has been updated successfully.",
    });

    navigate("/profile");
  };

  return (
    <div className="min-h-screen bg-background py-8 text-foreground transition-colors">
      <div className="container max-w-4xl mx-auto px-4 space-y-6">
        {/* Breadcrumbs & Title */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Link to="/profile" className="hover:text-primary transition-colors">Profile</Link>
            <span>›</span>
            <span className="font-semibold text-foreground">Edit Profile</span>
          </div>
          <Link to="/profile" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors">
            <ArrowLeft className="size-4" /> Back to Profile
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure your public-facing student portfolio cards.</p>
        </div>

        {/* Card 2: Basic Info */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Basic Info</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 h-11 bg-secondary border border-border text-foreground rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                placeholder="Full Name"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Username</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  className="w-full pl-8 pr-3.5 h-11 bg-secondary border border-border text-foreground rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  placeholder="username"
                />
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3.5 bg-secondary border border-border text-foreground rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all resize-none"
              placeholder="Tell other builders about yourself..."
            />
          </div>
        </div>

        {/* Card 3: Academic Info */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Academic Info</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">College / University</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full px-3.5 h-11 bg-secondary border border-border text-foreground rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                placeholder="e.g. State University"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Year of Study</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3.5 h-11 bg-secondary border border-border text-foreground rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              >
                <option value="Year 1">Year 1</option>
                <option value="Year 2">Year 2</option>
                <option value="Year 3">Year 3</option>
                <option value="Year 4">Year 4</option>
                <option value="Graduated">Graduated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Card 4: Skills & Interests */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Skills &amp; Interests</h2>

          {/* Group 1: Skills (Indigo tags) with dropdown */}
          <div className="space-y-2 relative" ref={skillsContainerRef}>
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Skills</label>
            <div className="flex flex-wrap gap-2 items-center min-h-[44px] p-2 bg-secondary border border-border rounded-xl focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary-soft text-primary text-xs font-semibold rounded-lg"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="hover:bg-primary/20 rounded p-0.5"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
              <div className="flex-1 min-w-[120px] relative">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => {
                    setSkillInput(e.target.value);
                    setDropdownOpen(true);
                  }}
                  onFocus={() => setDropdownOpen(true)}
                  onKeyDown={addSkill}
                  placeholder={skills.length === 0 ? "Type or select skill..." : "+ Add skill"}
                  className="w-full bg-transparent text-sm outline-none px-1 py-1 text-foreground"
                />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">Select from suggestions, or press Enter to add a custom skill.</p>

            {dropdownOpen && (
              <div className="absolute top-[100%] left-0 right-0 z-50 mt-1 bg-card border border-border rounded-xl shadow-lg max-h-48 overflow-y-auto p-1 divide-y divide-border/50 animate-in fade-in slide-in-from-top-1 duration-100">
                {filteredSkills.length > 0 ? (
                  filteredSkills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => {
                        if (!skills.includes(skill)) {
                          setSkills([...skills, skill]);
                        }
                        setSkillInput("");
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center justify-between text-foreground hover:bg-secondary hover:text-primary"
                    >
                      {skill}
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-xs text-muted-foreground text-center">
                    No suggestions. Press Enter to add "{skillInput}"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Card 5: Links */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Links</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">GitHub</label>
              <input
                type="text"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                className="w-full px-3.5 h-11 bg-secondary border border-border text-foreground rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                placeholder="github.com/..."
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">LinkedIn</label>
              <input
                type="text"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="w-full px-3.5 h-11 bg-secondary border border-border text-foreground rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                placeholder="linkedin.com/in/..."
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Portfolio</label>
              <input
                type="text"
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
                className="w-full px-3.5 h-11 bg-secondary border border-border text-foreground rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                placeholder="example.com"
              />
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-sm text-primary flex items-center justify-between shadow-glow">
          <p>
            ℹ Edit Profile saves only public profile info. Account security &amp; notifications are in{" "}
            <Link to="/settings" className="font-semibold underline hover:text-primary-hover">
              Settings →
            </Link>
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="h-10 px-5 border border-border text-foreground hover:bg-secondary rounded-xl text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="h-10 px-5 bg-primary hover:bg-primary-hover text-white rounded-xl text-sm font-semibold transition-colors shadow-glow"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

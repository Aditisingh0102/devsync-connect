import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { X, Plus, ArrowLeft } from "lucide-react";

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
  const [domainInput, setDomainInput] = useState("");
  const [roleInput, setRoleInput] = useState("");

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

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#f1f5f9] py-10 flex items-center justify-center">
        <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-6 text-center max-w-md shadow-sm">
          <p className="text-[#64748b]">No active session found. Please log in first.</p>
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
    }
  };

  const removeSkill = (indexToRemove) => {
    setSkills(skills.filter((_, idx) => idx !== indexToRemove));
  };

  const addDomain = (e) => {
    if (e.key === "Enter" && domainInput.trim()) {
      e.preventDefault();
      if (!domains.includes(domainInput.trim())) {
        setDomains([...domains, domainInput.trim()]);
      }
      setDomainInput("");
    }
  };

  const removeDomain = (indexToRemove) => {
    setDomains(domains.filter((_, idx) => idx !== indexToRemove));
  };

  const addRole = (e) => {
    if (e.key === "Enter" && roleInput.trim()) {
      e.preventDefault();
      if (!roles.includes(roleInput.trim())) {
        setRoles([...roles, roleInput.trim()]);
      }
      setRoleInput("");
    }
  };

  const removeRole = (indexToRemove) => {
    setRoles(roles.filter((_, idx) => idx !== indexToRemove));
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

  const handleSave = () => {
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
        github: github.trim(),
        linkedin: linkedin.trim(),
        portfolio: portfolio.trim(),
      },
    };

    dispatch({
      type: "updateUser",
      payload: updatedUser,
    });

    toast({
      title: "Profile Saved",
      description: "Your public profile has been updated successfully.",
    });

    navigate("/profile");
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] py-8 text-[#1e293b]">
      <div className="container max-w-4xl mx-auto px-4 space-y-6">
        {/* Breadcrumbs & Title */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-[#64748b] flex items-center gap-1.5">
            <Link to="/profile" className="hover:text-[#4f46e5]">Profile</Link>
            <span>›</span>
            <span className="font-semibold text-[#1e293b]">Edit Profile</span>
          </div>
          <Link to="/profile" className="text-sm text-[#64748b] hover:text-[#4f46e5] flex items-center gap-1">
            <ArrowLeft className="size-4" /> Back to Profile
          </Link>
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1e293b]">Edit Profile</h1>
          <p className="text-sm text-[#64748b] mt-1">Configure your public-facing student portfolio cards.</p>
        </div>



        {/* Card 2: Basic Info */}
        <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[16px_20px] shadow-sm space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#64748b]">Basic Info</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wide">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 h-[36px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] text-[13px] focus:outline-none focus:ring-1 focus:ring-[#4f46e5] focus:border-[#4f46e5] transition-all"
                placeholder="Full Name"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wide">Username</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#64748b]">@</span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  className="w-full pl-8 pr-3 h-[36px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] text-[13px] focus:outline-none focus:ring-1 focus:ring-[#4f46e5] focus:border-[#4f46e5] transition-all"
                  placeholder="username"
                />
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wide">Bio</label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] text-[13px] focus:outline-none focus:ring-1 focus:ring-[#4f46e5] focus:border-[#4f46e5] transition-all resize-none"
              placeholder="Tell other builders about yourself..."
            />
          </div>
        </div>

        {/* Card 3: Academic Info */}
        <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[16px_20px] shadow-sm space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#64748b]">Academic Info</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wide">College / University</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full px-3 h-[36px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] text-[13px] focus:outline-none focus:ring-1 focus:ring-[#4f46e5] focus:border-[#4f46e5] transition-all"
                placeholder="e.g. State University"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wide">Year of Study</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full px-3 h-[36px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] text-[13px] focus:outline-none focus:ring-1 focus:ring-[#4f46e5] focus:border-[#4f46e5] transition-all"
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
        <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[16px_20px] shadow-sm space-y-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#64748b]">Skills &amp; Interests</h2>

          {/* Group 1: Skills (Indigo tags) */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wide">Skills</label>
            <div className="flex flex-wrap gap-2 items-center min-h-[38px] p-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px]">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#ede9fe] text-[#4338ca] text-xs font-semibold rounded-[6px]"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="hover:bg-[#ddd6fe] rounded p-0.5"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={addSkill}
                placeholder={skills.length === 0 ? "Type skill and press Enter" : "+ Add skill"}
                className="bg-transparent text-[13px] outline-none ml-2 flex-1 min-w-[120px]"
              />
            </div>
            <p className="text-[10px] text-[#64748b]">Press Enter to add, click × to remove.</p>
          </div>

          {/* Group 2: Domains (Green tags) */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wide">Preferred Domains</label>
            <div className="flex flex-wrap gap-2 items-center min-h-[38px] p-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px]">
              {domains.map((dom, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#d1fae5] text-[#065f46] text-xs font-semibold rounded-[6px]"
                >
                  {dom}
                  <button
                    type="button"
                    onClick={() => removeDomain(index)}
                    className="hover:bg-[#a7f3d0] rounded p-0.5"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                onKeyDown={addDomain}
                placeholder={domains.length === 0 ? "Type domain and press Enter" : "+ Add"}
                className="bg-transparent text-[13px] outline-none ml-2 flex-1 min-w-[120px]"
              />
            </div>
            <p className="text-[10px] text-[#64748b]">Press Enter to add, click × to remove.</p>
          </div>

          {/* Group 3: Roles (Yellow tags) */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wide">Preferred Roles</label>
            <div className="flex flex-wrap gap-2 items-center min-h-[38px] p-2 bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px]">
              {roles.map((role, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#fef9c3] text-[#713f12] text-xs font-semibold rounded-[6px]"
                >
                  {role}
                  <button
                    type="button"
                    onClick={() => removeRole(index)}
                    className="hover:bg-[#fef08a] rounded p-0.5"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                onKeyDown={addRole}
                placeholder={roles.length === 0 ? "Type role and press Enter" : "+ Add"}
                className="bg-transparent text-[13px] outline-none ml-2 flex-1 min-w-[120px]"
              />
            </div>
            <p className="text-[10px] text-[#64748b]">Press Enter to add, click × to remove.</p>
          </div>
        </div>

        {/* Card 5: Links */}
        <div className="bg-white border border-[#e2e8f0] rounded-[12px] p-[16px_20px] shadow-sm space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#64748b]">Links</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wide">GitHub</label>
              <input
                type="text"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                className="w-full px-3 h-[36px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] text-[13px] focus:outline-none focus:ring-1 focus:ring-[#4f46e5] focus:border-[#4f46e5] transition-all"
                placeholder="github.com/..."
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wide">LinkedIn</label>
              <input
                type="text"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="w-full px-3 h-[36px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] text-[13px] focus:outline-none focus:ring-1 focus:ring-[#4f46e5] focus:border-[#4f46e5] transition-all"
                placeholder="linkedin.com/in/..."
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wide">Portfolio</label>
              <input
                type="text"
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
                className="w-full px-3 h-[36px] bg-[#f8fafc] border border-[#e2e8f0] rounded-[8px] text-[13px] focus:outline-none focus:ring-1 focus:ring-[#4f46e5] focus:border-[#4f46e5] transition-all"
                placeholder="example.com"
              />
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-[12px] p-4 text-sm text-[#1e40af] flex items-center justify-between">
          <p>
            ℹ Edit Profile saves only public profile info. Account security &amp; notifications are in{" "}
            <Link to="/settings" className="font-semibold underline hover:text-[#1d4ed8]">
              Settings →
            </Link>
          </p>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[#e2e8f0]">
          <button
            type="button"
            onClick={() => navigate("/profile")}
            className="h-9 px-4 border border-[#e2e8f0] text-[#1e293b] hover:bg-[#f8fafc] rounded-[8px] text-[13px] font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="h-9 px-4 bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-[8px] text-[13px] font-semibold transition-colors shadow-sm"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}

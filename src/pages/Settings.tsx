import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/lib/store";
import { Bell, Globe, ShieldCheck, UserRoundCog } from "lucide-react";

function toCsv(values?: string[]) {
  return (values || []).join(", ");
}

function fromCsv(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

export default function SettingsPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const currentUser = state.currentUser;

  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [college, setCollege] = useState("");
  const [bio, setBio] = useState("");
  const [skills, setSkills] = useState("");
  const [domains, setDomains] = useState("");
  const [roles, setRoles] = useState("");
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [profileVisibility, setProfileVisibility] = useState<"public" | "team-only">("public");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [collaborationAlerts, setCollaborationAlerts] = useState(true);
  const [discoverable, setDiscoverable] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    setName(currentUser.name || "");
    setHandle(currentUser.handle || "");
    setCollege(currentUser.college || "");
    setBio(currentUser.bio || "");
    setSkills(toCsv(currentUser.skills));
    setDomains(toCsv(currentUser.domains));
    setRoles(toCsv(currentUser.roles));
    setGithub(currentUser.links?.github || "");
    setLinkedin(currentUser.links?.linkedin || "");
    setPortfolio(currentUser.links?.portfolio || "");
    setProfileVisibility(currentUser.preferences?.profileVisibility || "public");
    setEmailNotifications(currentUser.preferences?.emailNotifications ?? true);
    setCollaborationAlerts(currentUser.preferences?.collaborationAlerts ?? true);
    setDiscoverable(currentUser.preferences?.discoverable ?? true);
  }, [currentUser]);

  if (!currentUser) return <div className="container py-10">No current user.</div>;

  const save = () => {
    dispatch({
      type: "updateUser",
      payload: {
        ...currentUser,
        name,
        handle,
        college,
        bio,
        skills: fromCsv(skills),
        domains: fromCsv(domains),
        roles: fromCsv(roles),
        links: {
          github,
          linkedin,
          portfolio,
        },
        preferences: {
          profileVisibility,
          emailNotifications,
          collaborationAlerts,
          discoverable,
        },
      },
    });
  };

  const deleteAccount = () => {
    if (!currentUser) return;
    const confirmed = window.confirm("Permanently delete your DevSync account? This cannot be undone.");
    if (!confirmed) return;

    dispatch({ type: "deleteUser", payload: { id: currentUser.id } });
    navigate("/");
  };

  return (
    <div className="container py-10 space-y-6">
      <div className="ds-card p-7 bg-gradient-hero flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="ds-chip-primary">Settings</span>
          <h1 className="ds-page-title mt-2">Profile and visibility controls</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">Update your profile identity, collaboration preferences, and discovery settings without leaving the DevSync design system.</p>
        </div>
        <Link to="/profile" className="h-10 px-4 rounded-xl bg-card border border-border font-semibold text-sm inline-flex items-center gap-2 hover:bg-secondary">
          <UserRoundCog className="size-4" /> View Profile
        </Link>
      </div>

      <div className="grid lg:grid-cols-[1.3fr_0.9fr] gap-5">
        <div className="ds-card p-6 space-y-5">
          <div>
            <h2 className="font-semibold text-lg">Profile details</h2>
            <p className="text-sm text-muted-foreground">These values are used across your dashboard, feed, and builder discovery profile.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="space-y-1">
              <span className="text-sm font-medium">Full name</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className="ds-input" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">Username</span>
              <input value={handle} onChange={(e) => setHandle(e.target.value)} className="ds-input" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">College</span>
              <input value={college} onChange={(e) => setCollege(e.target.value)} className="ds-input" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">Bio</span>
              <input value={bio} onChange={(e) => setBio(e.target.value)} className="ds-input" />
            </label>
          </div>

          <label className="space-y-1 block">
            <span className="text-sm font-medium">Skills</span>
            <input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, TypeScript, Node.js" className="ds-input" />
          </label>

          <label className="space-y-1 block">
            <span className="text-sm font-medium">Preferred domains</span>
            <input value={domains} onChange={(e) => setDomains(e.target.value)} placeholder="Frontend, AI/ML, Cloud" className="ds-input" />
          </label>

          <label className="space-y-1 block">
            <span className="text-sm font-medium">Preferred roles</span>
            <input value={roles} onChange={(e) => setRoles(e.target.value)} placeholder="Frontend, Backend, Designer" className="ds-input" />
          </label>

          <div className="grid md:grid-cols-3 gap-4">
            <label className="space-y-1">
              <span className="text-sm font-medium">GitHub</span>
              <input value={github} onChange={(e) => setGithub(e.target.value)} className="ds-input" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">LinkedIn</span>
              <input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} className="ds-input" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">Portfolio</span>
              <input value={portfolio} onChange={(e) => setPortfolio(e.target.value)} className="ds-input" />
            </label>
          </div>

          <div className="flex gap-2 justify-end">
            <button onClick={() => dispatch({ type: "updateUser", payload: currentUser })} className="h-10 px-4 rounded-xl bg-card border border-border font-semibold text-sm">
              Reset
            </button>
            <button onClick={save} className="h-10 px-4 rounded-xl bg-primary text-white font-semibold text-sm">
              Save changes
            </button>
          </div>
        </div>

        <div className="space-y-5">
          <div className="ds-card p-6 space-y-4">
            <h2 className="font-semibold text-lg inline-flex items-center gap-2"><Globe className="size-4 text-primary" /> Visibility</h2>
            <div className="space-y-2">
              {(["public", "team-only"] as const).map((option) => (
                <button key={option} onClick={() => setProfileVisibility(option)} className={`w-full p-3 rounded-xl border text-left ${profileVisibility === option ? "border-primary bg-primary-soft" : "border-border bg-card"}`}>
                  <div className="font-medium capitalize">{option.replace("-", " ")}</div>
                  <div className="text-xs text-muted-foreground">{option === "public" ? "Visible to builders across DevSync." : "Visible only to people you collaborate with."}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="ds-card p-6 space-y-4">
            <h2 className="font-semibold text-lg inline-flex items-center gap-2"><Bell className="size-4 text-primary" /> Notifications</h2>
            <label className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-alt border border-border">
              <div>
                <div className="font-medium text-sm">Email notifications</div>
                <div className="text-xs text-muted-foreground">Receive updates about requests and reviews.</div>
              </div>
              <input type="checkbox" checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} />
            </label>
            <label className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-alt border border-border">
              <div>
                <div className="font-medium text-sm">Collaboration alerts</div>
                <div className="text-xs text-muted-foreground">Get notified when someone responds or follows you.</div>
              </div>
              <input type="checkbox" checked={collaborationAlerts} onChange={(e) => setCollaborationAlerts(e.target.checked)} />
            </label>
            <label className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-alt border border-border">
              <div>
                <div className="font-medium text-sm">Discoverable profile</div>
                <div className="text-xs text-muted-foreground">Allow builders to find you in discovery.</div>
              </div>
              <input type="checkbox" checked={discoverable} onChange={(e) => setDiscoverable(e.target.checked)} />
            </label>
          </div>

          <div className="ds-card p-6 space-y-4">
            <h2 className="font-semibold text-lg inline-flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /> Account actions</h2>
            <p className="text-sm text-muted-foreground">Profile data is stored locally in the frontend store and updates instantly across the app.</p>
            <div className="text-xs text-muted-foreground">Need to edit your avatar? Use the profile page photo editor.</div>
            <button onClick={deleteAccount} className="h-11 w-full rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors">
              Permanently delete account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

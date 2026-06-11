import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/lib/store";
import { Bell, Globe, ShieldCheck, UserRoundCog, AlertTriangle, Clock } from "lucide-react";

function toCsv(values?: string[]) {
  return (values || []).join(", ");
}

function fromCsv(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "0h 0m 0s";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
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
  const [github, setGithub] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [profileVisibility, setProfileVisibility] = useState<"public" | "team-only">("public");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [collaborationAlerts, setCollaborationAlerts] = useState(true);
  const [discoverable, setDiscoverable] = useState(true);
  const [countdown, setCountdown] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const isPendingDeletion = currentUser?.accountStatus === "pending_deletion";
  const SEVENTY_TWO_HOURS = 72 * 60 * 60 * 1000;

  // Countdown timer for pending deletion
  useEffect(() => {
    if (!isPendingDeletion || !currentUser?.deactivatedAt) {
      setCountdown(null);
      return;
    }

    const updateCountdown = () => {
      const deactivatedTime = new Date(currentUser.deactivatedAt!).getTime();
      const remaining = SEVENTY_TWO_HOURS - (Date.now() - deactivatedTime);
      if (remaining <= 0) {
        setCountdown("0h 0m 0s");
      } else {
        setCountdown(formatCountdown(remaining));
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [isPendingDeletion, currentUser?.deactivatedAt]);

  useEffect(() => {
    if (!currentUser) return;
    setName(currentUser.name || "");
    setHandle(currentUser.handle || "");
    setCollege(currentUser.college || "");
    setBio(currentUser.bio || "");
    setSkills(toCsv(currentUser.skills));

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

  const scheduleDelete = () => {
    if (confirmText !== "DELETE") return;
    dispatch({ type: "scheduleDeleteUser", payload: { id: currentUser.id } });
    setShowDeleteConfirm(false);
    setConfirmText("");
  };

  const cancelDelete = () => {
    dispatch({ type: "cancelDeleteUser", payload: { id: currentUser.id } });
  };

  return (
    <div className="container py-10 space-y-6">
      {/* Pending deletion banner */}
      {isPendingDeletion && countdown && (
        <div className="rounded-2xl border-2 border-red-500/40 bg-red-500/10 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="flex items-center gap-3 shrink-0">
            <div className="size-10 rounded-xl bg-red-600 flex items-center justify-center">
              <AlertTriangle className="size-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-red-400">Account Deletion Scheduled</h3>
              <p className="text-sm text-muted-foreground">Your account and all associated data will be permanently deleted.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600/20 border border-red-500/30">
              <Clock className="size-4 text-red-400" />
              <span className="font-mono font-bold text-red-300 text-sm">{countdown}</span>
            </div>
            <button
              onClick={cancelDelete}
              className="h-10 px-5 rounded-xl bg-white text-black font-semibold text-sm hover:bg-gray-100 transition-colors"
            >
              Cancel Deletion
            </button>
          </div>
        </div>
      )}

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

          <div className="space-y-3">
            <span className="text-sm font-medium">Skills</span>

            {/* Current Skills as Tags */}
            <div className="flex flex-wrap gap-2 mb-2 p-3 bg-secondary/30 border border-border rounded-xl min-h-[50px]">
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

            {/* Input to type and add skill */}
            <div className="flex gap-2">
              <input
                id="new-skill-input"
                placeholder="e.g. Next.js, Rust, Docker"
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
                  const input = document.getElementById("new-skill-input") as HTMLInputElement;
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

            {/* Popular/Recommended Skills list */}
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">Popular Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {["React", "TypeScript", "Python", "Node.js", "UI/UX", "ML", "DevOps", "Mobile", "Data", "Cloud", "Next.js", "Tailwind", "Supabase", "PostgreSQL", "Figma"].map((s) => {
                  const current = skills.split(",").map((x) => x.trim()).filter(Boolean);
                  const isAdded = current.includes(s);
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={isAdded}
                      onClick={() => {
                        if (!isAdded) {
                          setSkills([...current, s].join(", "));
                        }
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs border transition-all ${
                        isAdded
                          ? "bg-secondary/40 text-muted-foreground border-border cursor-not-allowed opacity-55"
                          : "bg-secondary hover:bg-card border-border text-foreground hover:border-primary"
                      }`}
                    >
                      + {s}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>



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

            {isPendingDeletion ? (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
                    <AlertTriangle className="size-4" />
                    Deletion in progress
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Your account is scheduled for permanent deletion. All your posts, projects, and data will be removed after the countdown ends.
                  </p>
                  {countdown && (
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="size-3.5 text-red-400" />
                      <span className="font-mono text-sm text-red-300 font-bold">{countdown} remaining</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={cancelDelete}
                  className="h-11 w-full rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Cancel deletion &amp; reactivate account
                </button>
              </div>
            ) : (
              <>
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="h-11 w-full rounded-2xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
                  >
                    Permanently delete account
                  </button>
                ) : (
                  <div className="space-y-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-2 text-red-400 font-semibold text-sm">
                      <AlertTriangle className="size-4" />
                      Are you sure?
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your account will be deactivated immediately and <strong>permanently deleted after 72 hours</strong>.
                      You can cancel the deletion at any time before the deadline from this page.
                    </p>
                    <label className="space-y-1 block">
                      <span className="text-xs font-medium text-muted-foreground">
                        Type <strong className="text-red-400">DELETE</strong> to confirm
                      </span>
                      <input
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        placeholder="DELETE"
                        className="ds-input font-mono text-sm"
                        autoFocus
                      />
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setShowDeleteConfirm(false); setConfirmText(""); }}
                        className="h-10 flex-1 rounded-xl bg-card border border-border font-semibold text-sm hover:bg-secondary transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={scheduleDelete}
                        disabled={confirmText !== "DELETE"}
                        className="h-10 flex-1 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Schedule deletion (72h)
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

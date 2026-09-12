import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "@/lib/store";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import { 
  Lock, Eye, Bell, Shield, AlertTriangle, Clock, ArrowLeft, Trash2
} from "lucide-react";

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
  const { toast } = useToast();
  const currentUser = state.currentUser;

  // Sticky sidebar active state tracking
  const [activeTab, setActiveTab] = useState("account");

  // CARD 1 States (Account Security)
  const [fullName, setFullName] = useState(currentUser?.name || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // CARD 2 States (Profile Visibility)
  const [profileVisibility, setProfileVisibility] = useState("public");

  // CARD 3 States (Notifications)
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [collaborationAlerts, setCollaborationAlerts] = useState(true);
  const [discoverable, setDiscoverable] = useState(true);
  const [teamInviteNotifications, setTeamInviteNotifications] = useState(false);

  // CARD 4 States (Privacy)
  const [dataSharing, setDataSharing] = useState(true);
  const [profileIndexing, setProfileIndexing] = useState(false);

  // Danger Zone States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [countdown, setCountdown] = useState<string | null>(null);

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

  // Load state from context on mount
  useEffect(() => {
    if (!currentUser) return;
    setProfileVisibility(currentUser.preferences?.profileVisibility || "public");
    setEmailNotifications(currentUser.preferences?.emailNotifications ?? true);
    setCollaborationAlerts(currentUser.preferences?.collaborationAlerts ?? true);
    setDiscoverable(currentUser.preferences?.discoverable ?? true);
    setTeamInviteNotifications(currentUser.preferences?.teamInviteNotifications ?? false);
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="container py-10">
        <div className="bg-card border border-border rounded-[12px] p-6 text-center">
          No current user session. Please log in.
        </div>
      </div>
    );
  }

  // Scroll to section helper
  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 90; // offset for navbar
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  // Password update action
  const handleUpdatePassword = async () => {
    if (!newPassword.trim()) {
      toast({
        title: "Validation Error",
        description: "New password cannot be empty.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Validation Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    // Need a current password for the backend, but since the UI doesn't have a field for it,
    // let's use a dummy one for now, or just send new_password if the backend allows it.
    // Wait, the API requires current_password and new_password. Let's add a prompt for it.
    const currentPassword = prompt("Please enter your current password:");
    if (!currentPassword) return;

    try {
      await api.changePassword({ current_password: currentPassword, new_password: newPassword });
      
      // Update local state if needed (password usually not stored in local state, but just in case)
      dispatch({
        type: "updateUser",
        payload: {
          ...currentUser,
          password: newPassword,
        },
      });

      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully.",
      });

      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast({
        title: "Failed to update password",
        description: err.message || "An error occurred",
        variant: "destructive",
      });
    }
  };

  // Visibility change action
  const handleVisibilityChange = (val: "public" | "team-only" | "private") => {
    setProfileVisibility(val);
    dispatch({
      type: "updateUser",
      payload: {
        ...currentUser,
        preferences: {
          ...currentUser.preferences,
          profileVisibility: val,
        },
      },
    });
    toast({
      title: "Settings Saved",
      description: `Profile visibility updated to ${val.replace("-", " ")}.`,
    });
  };

  // Preference Toggle Action
  const handlePreferenceToggle = (key: string, currentVal: boolean, setValState: (b: boolean) => void) => {
    const newVal = !currentVal;
    setValState(newVal);
    dispatch({
      type: "updateUser",
      payload: {
        ...currentUser,
        preferences: {
          ...currentUser.preferences,
          [key]: newVal,
        },
      },
    });
    toast({
      title: "Settings Saved",
      description: "Notification preferences updated.",
    });
  };

  // Deletion logic
  const handleScheduleDelete = () => {
    if (confirmText !== "DELETE") {
      toast({
        title: "Error",
        description: "Please type DELETE to confirm.",
        variant: "destructive",
      });
      return;
    }
    dispatch({ type: "scheduleDeleteUser", payload: { id: currentUser.id } });
    setShowDeleteModal(false);
    setConfirmText("");
  };

  const handleCancelDelete = () => {
    dispatch({ type: "cancelDeleteUser", payload: { id: currentUser.id } });
    toast({
      title: "Account Reactivated",
      description: "Your account deletion schedule has been cancelled.",
    });
  };

  return (
    <div className="min-h-screen bg-background py-8 text-foreground">
      <div className="container max-w-4xl mx-auto px-4 space-y-6">
        {/* Breadcrumb & Top Bar */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Link to="/profile" className="hover:text-primary">Profile</Link>
            <span>›</span>
            <span className="font-semibold text-foreground">Settings</span>
          </div>
          <Link to="/profile" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
            <ArrowLeft className="size-4" /> Back to Profile
          </Link>
        </div>

        {/* Deactivation countdown banner */}
        {isPendingDeletion && countdown && (
          <div className="rounded-[12px] border-2 border-destructive/40 bg-destructive/10 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-3 shrink-0">
              <div className="size-10 rounded-xl bg-destructive flex items-center justify-center">
                <AlertTriangle className="size-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-destructive">Account Deletion Scheduled</h3>
                <p className="text-sm text-muted-foreground">Your account will be permanently deleted after the countdown.</p>
              </div>
            </div>
            <div className="flex items-center gap-4 ml-auto">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-destructive/20 border border-destructive/30">
                <Clock className="size-4 text-destructive" />
                <span className="font-mono font-bold text-destructive text-sm">{countdown}</span>
              </div>
              <button
                onClick={handleCancelDelete}
                className="h-10 px-5 rounded-xl bg-card text-black font-semibold text-sm hover:bg-gray-100 transition-colors border border-border"
              >
                Cancel Deletion
              </button>
            </div>
          </div>
        )}

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your account security, visibility, and notification preferences.</p>
        </div>

        {/* Two-Column Grid Layout */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Left Column Sticky Sidebar */}
          <div className="w-full md:w-[165px] shrink-0 md:sticky md:top-24 space-y-1">
            <button
              onClick={() => scrollToSection("account")}
              className={`w-full text-left px-3 py-2 text-[13px] rounded-[8px] transition-all flex items-center gap-2 ${
                activeTab === "account"
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/50"
              }`}
            >
              🔒 Account
            </button>
            <button
              onClick={() => scrollToSection("visibility")}
              className={`w-full text-left px-3 py-2 text-[13px] rounded-[8px] transition-all flex items-center gap-2 ${
                activeTab === "visibility"
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/50"
              }`}
            >
              👁 Visibility
            </button>
            <button
              onClick={() => scrollToSection("notifications")}
              className={`w-full text-left px-3 py-2 text-[13px] rounded-[8px] transition-all flex items-center gap-2 ${
                activeTab === "notifications"
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/50"
              }`}
            >
              🔔 Notifications
            </button>
            <button
              onClick={() => scrollToSection("privacy")}
              className={`w-full text-left px-3 py-2 text-[13px] rounded-[8px] transition-all flex items-center gap-2 ${
                activeTab === "privacy"
                  ? "bg-primary/10 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-card/50"
              }`}
            >
              🛡 Privacy
            </button>
            <button
              onClick={() => scrollToSection("danger-zone")}
              className={`w-full text-left px-3 py-2 text-[13px] rounded-[8px] transition-all flex items-center gap-2 ${
                activeTab === "danger-zone"
                  ? "bg-primary/10 text-destructive font-semibold"
                  : "text-destructive hover:bg-destructive/10"
              }`}
            >
              🗑 Danger zone
            </button>
          </div>

          {/* Right Column Content Cards */}
          <div className="flex-1 w-full space-y-6">
            
            {/* Card 1: Account Security */}
            <div
              id="account"
              className="bg-card border border-border rounded-[12px] p-[16px_20px] shadow-sm space-y-4 scroll-mt-24"
            >
              <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
                <h2 className="text-sm font-bold tracking-tight text-foreground">Account Security</h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
                  🔒 Account security
                </span>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Full Name</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="flex-1 px-3 h-[36px] bg-secondary border border-border rounded-[8px] text-[13px] focus:outline-none focus:ring-1 focus:ring-ring focus:border-primary transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!fullName.trim()) {
                          toast({ title: "Validation Error", description: "Name cannot be empty.", variant: "destructive" });
                          return;
                        }
                        dispatch({ type: "updateUser", payload: { ...currentUser, name: fullName.trim() } });
                        toast({ title: "Name Updated", description: "Your name has been updated everywhere." });
                      }}
                      className="h-[36px] px-3 bg-primary hover:bg-primary-hover text-white rounded-[8px] text-[12px] font-semibold transition-colors shadow-sm whitespace-nowrap"
                    >
                      Update
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Email address</label>
                  <input
                    type="email"
                    value={currentUser?.email || `${currentUser?.username || "student"}@college.edu`}
                    disabled
                    className="w-full px-3 h-[36px] bg-secondary border border-border rounded-[8px] text-[13px] text-muted-foreground cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">College / University</label>
                  <input
                    type="text"
                    value={currentUser?.college || "Not added"}
                    disabled
                    className="w-full px-3 h-[36px] bg-secondary border border-border rounded-[8px] text-[13px] text-muted-foreground cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">New password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 h-[36px] bg-secondary border border-border rounded-[8px] text-[13px] focus:outline-none focus:ring-1 focus:ring-ring focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Confirm password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 h-[36px] bg-secondary border border-border rounded-[8px] text-[13px] focus:outline-none focus:ring-1 focus:ring-ring focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleUpdatePassword}
                  className="h-9 px-4 bg-primary hover:bg-primary-hover text-white rounded-[8px] text-[13px] font-semibold transition-colors shadow-sm"
                >
                  Update password
                </button>
              </div>
            </div>

            {/* Card 2: Profile Visibility */}
            <div
              id="visibility"
              className="bg-card border border-border rounded-[12px] p-[16px_20px] shadow-sm space-y-4 scroll-mt-24"
            >
              <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
                <h2 className="text-sm font-bold tracking-tight text-foreground">Profile Visibility</h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
                  👁 Profile visibility
                </span>
              </div>

              <div className="space-y-3">
                {/* Option 1: Public */}
                <div
                  onClick={() => handleVisibilityChange("public")}
                  className={`w-full p-4 rounded-[12px] border text-left cursor-pointer transition-all flex items-start gap-3 select-none ${
                    profileVisibility === "public"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  <div className="size-4 rounded-full border border-input flex items-center justify-center mt-0.5 shrink-0 bg-card">
                    {profileVisibility === "public" && (
                      <div className="size-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">Public</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Visible to all builders across DevSync</p>
                  </div>
                </div>

                {/* Option 2: Team Only */}
                <div
                  onClick={() => handleVisibilityChange("team-only")}
                  className={`w-full p-4 rounded-[12px] border text-left cursor-pointer transition-all flex items-start gap-3 select-none ${
                    profileVisibility === "team-only"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  <div className="size-4 rounded-full border border-input flex items-center justify-center mt-0.5 shrink-0 bg-card">
                    {profileVisibility === "team-only" && (
                      <div className="size-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">Team Only</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Visible only to people you collaborate with</p>
                  </div>
                </div>

                {/* Option 3: Private */}
                <div
                  onClick={() => handleVisibilityChange("private")}
                  className={`w-full p-4 rounded-[12px] border text-left cursor-pointer transition-all flex items-start gap-3 select-none ${
                    profileVisibility === "private"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  <div className="size-4 rounded-full border border-input flex items-center justify-center mt-0.5 shrink-0 bg-card">
                    {profileVisibility === "private" && (
                      <div className="size-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">Private</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Only you can see your profile</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Notifications */}
            <div
              id="notifications"
              className="bg-card border border-border rounded-[12px] p-[16px_20px] shadow-sm space-y-4 scroll-mt-24"
            >
              <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
                <h2 className="text-sm font-bold tracking-tight text-foreground">Notifications</h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
                  🔔 Notifications
                </span>
              </div>

              <div className="space-y-4">
                {/* Toggle 1: Email notifications */}
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">Email notifications</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Receive updates about requests and reviews</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePreferenceToggle("emailNotifications", emailNotifications, setEmailNotifications)}
                    className={`relative w-9 h-5 rounded-full transition-colors ${
                      emailNotifications ? "bg-primary" : "bg-[#e2e8f0]"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 size-4 rounded-full bg-card shadow transition-transform ${
                        emailNotifications ? "translate-x-[18px]" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                {/* Toggle 2: Collaboration alerts */}
                <div className="flex items-center justify-between gap-4 pt-3 border-t border-[#f1f5f9]">
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">Collaboration alerts</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Get notified when someone responds or follows you</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePreferenceToggle("collaborationAlerts", collaborationAlerts, setCollaborationAlerts)}
                    className={`relative w-9 h-5 rounded-full transition-colors ${
                      collaborationAlerts ? "bg-primary" : "bg-[#e2e8f0]"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 size-4 rounded-full bg-card shadow transition-transform ${
                        collaborationAlerts ? "translate-x-[18px]" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                {/* Toggle 3: Discoverable profile */}
                <div className="flex items-center justify-between gap-4 pt-3 border-t border-[#f1f5f9]">
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">Discoverable profile</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Allow builders to find you in skill search</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePreferenceToggle("discoverable", discoverable, setDiscoverable)}
                    className={`relative w-9 h-5 rounded-full transition-colors ${
                      discoverable ? "bg-primary" : "bg-[#e2e8f0]"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 size-4 rounded-full bg-card shadow transition-transform ${
                        discoverable ? "translate-x-[18px]" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                {/* Toggle 4: Team invite notifications */}
                <div className="flex items-center justify-between gap-4 pt-3 border-t border-[#f1f5f9]">
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">Team invite notifications</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Notify when I receive a team invite</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePreferenceToggle("teamInviteNotifications", teamInviteNotifications, setTeamInviteNotifications)}
                    className={`relative w-9 h-5 rounded-full transition-colors ${
                      teamInviteNotifications ? "bg-primary" : "bg-[#e2e8f0]"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 size-4 rounded-full bg-card shadow transition-transform ${
                        teamInviteNotifications ? "translate-x-[18px]" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Card 4: Privacy */}
            <div
              id="privacy"
              className="bg-card border border-border rounded-[12px] p-[16px_20px] shadow-sm space-y-4 scroll-mt-24"
            >
              <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
                <h2 className="text-sm font-bold tracking-tight text-foreground">Privacy &amp; Data</h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary">
                  🛡 Privacy
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">Data Sharing</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Allow data analytics to improve user experience</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDataSharing(!dataSharing)}
                    className={`relative w-9 h-5 rounded-full transition-colors ${
                      dataSharing ? "bg-primary" : "bg-[#e2e8f0]"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 size-4 rounded-full bg-card shadow transition-transform ${
                        dataSharing ? "translate-x-[18px]" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4 pt-3 border-t border-[#f1f5f9]">
                  <div>
                    <h4 className="font-semibold text-sm text-foreground">Profile indexing</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Allow search engines to index your profile page</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProfileIndexing(!profileIndexing)}
                    className={`relative w-9 h-5 rounded-full transition-colors ${
                      profileIndexing ? "bg-primary" : "bg-[#e2e8f0]"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 size-4 rounded-full bg-card shadow transition-transform ${
                        profileIndexing ? "translate-x-[18px]" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Card 5: Danger Zone */}
            <div
              id="danger-zone"
              className="bg-card border border-border rounded-[12px] p-[16px_20px] shadow-sm space-y-4 scroll-mt-24"
            >
              <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
                <h2 className="text-sm font-bold tracking-tight text-foreground">Danger Zone</h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-destructive/10 text-destructive">
                  ⚠ Danger zone
                </span>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  These actions are permanent and cannot be undone. Please proceed with caution.
                </p>

                {isPendingDeletion ? (
                  <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 space-y-2">
                    <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
                      <AlertTriangle className="size-4" />
                      Deletion is scheduled
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your account will be permanently deleted. You can cancel this schedule anytime from this page.
                    </p>
                    {countdown && (
                      <div className="flex items-center gap-2 text-destructive font-mono font-bold text-sm">
                        <Clock className="size-4" />
                        <span>{countdown} remaining</span>
                      </div>
                    )}
                    <button
                      onClick={handleCancelDelete}
                      className="mt-2 h-9 w-full bg-success hover:bg-success/90 text-white rounded-[8px] text-[13px] font-semibold transition-colors"
                    >
                      Reactivate Account
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full h-9 bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30 rounded-[8px] text-[13px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="size-4" /> Permanently delete account
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay backdrop */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => { setShowDeleteModal(false); setConfirmText(""); }}
          />

          {/* Dialog Container */}
          <div className="relative bg-card border border-border rounded-[16px] p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-destructive/10 flex items-center justify-center text-destructive shrink-0">
                <AlertTriangle className="size-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-foreground">Are you absolutely sure?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your account will be deactivated immediately and permanently deleted after a <strong>72-hour grace period</strong>. 
                  All your projects, applications, and logs will be permanently deleted.
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-[#f1f5f9]">
              <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                Type <strong className="text-destructive">DELETE</strong> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full px-3 h-[36px] bg-secondary border border-border rounded-[8px] text-[13px] font-mono focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 transition-all"
                autoFocus
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => { setShowDeleteModal(false); setConfirmText(""); }}
                className="h-9 px-4 border border-border text-foreground hover:bg-secondary rounded-[8px] text-[13px] font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleScheduleDelete}
                disabled={confirmText !== "DELETE"}
                className="h-9 px-4 bg-destructive hover:bg-destructive/90 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-[8px] text-[13px] font-semibold transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

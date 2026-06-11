import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { Bell, CheckCheck, MessageSquare, UserPlus, Zap, Settings, ArrowRight, Star, LogIn } from "lucide-react";

const icons = {
  invite: UserPlus,
  project: Zap,
  task: MessageSquare,
  system: Settings,
  request: MessageSquare,
  follow: UserPlus,
  review: Star,
} as const;

const colors = {
  invite: "bg-primary-soft text-primary",
  project: "bg-[hsl(var(--cyan)/0.12)] text-cyan",
  task: "bg-[hsl(var(--warning)/0.12)] text-warning",
  system: "bg-secondary text-muted-foreground",
  request: "bg-primary-soft text-primary",
  follow: "bg-[hsl(var(--purple)/0.12)] text-purple",
  review: "bg-success-bg text-success",
} as const;

function bucket(date: string): "Today" | "This Week" | "Earlier" {
  const d = +new Date(date);
  const now = Date.now();
  const day = 86400000;
  if (now - d < day) return "Today";
  if (now - d < 7 * day) return "This Week";
  return "Earlier";
}

export default function Notifications() {
  const { state, dispatch } = useApp();

  if (!state.currentUser) {
    return (
      <div className="container py-16 max-w-lg min-h-[calc(100vh-8rem)] flex items-center justify-center">
        {/* Background glow */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 -right-32 size-[400px] rounded-full bg-primary/10 blur-[100px]" />
          <div className="absolute bottom-1/3 -left-32 size-[300px] rounded-full bg-purple/10 blur-[100px]" />
        </div>

        <div className="w-full text-center">
          <div className="ds-card p-8 backdrop-blur-xl border-border/50 shadow-glow relative overflow-hidden">
            {/* Header Icon */}
            <div className="relative size-20 mx-auto mb-6 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg">
              <Bell className="size-10 text-white animate-bounce" />
              <div className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-[11px] font-bold text-white shadow-sm ring-2 ring-background">
                !
              </div>
            </div>

            <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight mb-3">
              Join DevSync to View Notifications
            </h1>
            
            <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-sm mx-auto">
              Stay updated on collaboration requests, new follows, peer reviews, and activity on your project posts.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/login"
                className="h-11 px-6 rounded-xl bg-primary text-white font-semibold text-sm inline-flex items-center justify-center gap-2 hover:bg-primary-hover transition-all active:scale-[0.98] shadow-glow"
              >
                <LogIn className="size-4" />
                Sign In
              </Link>
              <Link
                to="/signup"
                className="h-11 px-6 rounded-xl bg-card border border-border text-foreground font-semibold text-sm inline-flex items-center justify-center gap-2 hover:bg-secondary transition-colors"
              >
                <UserPlus className="size-4" />
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const [filter, setFilter] = useState<"all" | "unread">("all");

  const items = useMemo(() => {
    return Object.values(state.notifications)
      .filter((n) => !n.userId || (state.currentUser && n.userId === state.currentUser.id))
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [state.notifications, state.currentUser]);
  const unread = items.filter((item) => !item.read).length;
  const shown = items.filter((item) => filter === "all" || !item.read);

  const groups: Record<string, typeof shown> = { Today: [], "This Week": [], Earlier: [] };
  shown.forEach((n) => groups[bucket(n.createdAt)].push(n));

  return (
    <div className="container py-10 max-w-3xl">
      <div className="ds-card p-7 mb-6 bg-gradient-hero flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="ds-chip-primary"><Bell className="size-3.5" /> {unread} unread</span>
          <h1 className="ds-page-title mt-2">Notifications</h1>
          <p className="text-sm text-muted-foreground mt-1">Track requests, follows, reviews, and post activity in one place.</p>
        </div>
        <button onClick={() => dispatch({ type: "markAllNotificationsRead" })} className="h-10 px-4 rounded-xl bg-card border border-border text-sm font-semibold inline-flex items-center gap-2 hover:bg-secondary">
          <CheckCheck className="size-4" /> Mark all read
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {(["all", "unread"] as const).map((item) => (
          <button key={item} onClick={() => setFilter(item)} className={`px-4 h-9 rounded-lg text-sm font-medium capitalize transition-colors ${filter === item ? "bg-primary text-white" : "bg-card border border-border text-muted-foreground hover:bg-secondary"}`}>
            {item}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="ds-card p-12 text-center">
          <div className="size-14 rounded-2xl bg-secondary mx-auto flex items-center justify-center mb-3"><Bell className="size-6 text-muted-foreground" /></div>
          <p className="font-semibold">You're all caught up</p>
          <p className="text-sm text-muted-foreground mt-1">New collaboration requests, follows, and post activity will show up here.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {(["Today", "This Week", "Earlier"] as const).map((label) =>
            groups[label].length ? (
              <div key={label}>
                <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2 px-1">{label}</div>
                <div className="space-y-2">
                  {groups[label].map((notification) => {
                    const Icon = icons[notification.type];
                    return (
                      <Link
                        key={notification.id}
                        to={notification.href || "#"}
                        onClick={() => dispatch({ type: "markNotificationRead", payload: { id: notification.id } })}
                        className={`ds-card p-4 flex gap-4 cursor-pointer transition-all hover:shadow-[var(--shadow-md)] ${!notification.read ? "border-primary/30 bg-primary-soft/30" : ""}`}
                      >
                        <div className={`size-11 rounded-xl flex items-center justify-center shrink-0 ${colors[notification.type]}`}><Icon className="size-5" /></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-sm">{notification.title}</p>
                            <span className="text-xs text-muted-foreground shrink-0">{new Date(notification.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-0.5">{notification.body}</p>
                          {notification.href && <span className="mt-2 text-xs font-semibold text-primary inline-flex items-center gap-1">Open <ArrowRight className="size-3.5" /></span>}
                        </div>
                        {!notification.read && <div className="size-2 rounded-full bg-primary mt-2" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}

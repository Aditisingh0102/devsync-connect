import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { Bell, CheckCheck, MessageSquare, UserPlus, Zap, Settings, ArrowRight } from "lucide-react";

const icons = {
  invite: UserPlus,
  project: Zap,
  task: MessageSquare,
  system: Settings,
  request: MessageSquare,
  follow: UserPlus,
  review: CheckCheck,
} as const;

const colors = {
  invite: "bg-primary-soft text-primary",
  project: "bg-[hsl(var(--cyan)/0.12)] text-cyan",
  task: "bg-[hsl(var(--warning)/0.12)] text-warning",
  system: "bg-secondary text-muted-foreground",
  request: "bg-[hsl(var(--green)/0.12)] text-success",
  follow: "bg-primary-soft text-primary",
  review: "bg-success-bg text-success",
} as const;

export default function Notifications() {
  const { state, dispatch } = useApp();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const items = useMemo(() => Object.values(state.notifications).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)), [state.notifications]);
  const unread = items.filter((item) => !item.read).length;
  const shown = items.filter((item) => filter === "all" || !item.read);

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

      <div className="space-y-2">
        {shown.length === 0 && <div className="ds-card p-12 text-center text-muted-foreground">You're all caught up.</div>}
        {shown.map((notification) => {
          const Icon = icons[notification.type];
          return (
            <Link
              key={notification.id}
              to={notification.href || "#"}
              onClick={() => dispatch({ type: "markNotificationRead", payload: { id: notification.id } })}
              className={`ds-card p-4 flex gap-4 cursor-pointer transition-all hover:shadow-card ${!notification.read ? "border-primary/30 bg-primary-soft/30" : ""}`}
            >
              <div className={`size-11 rounded-xl flex items-center justify-center shrink-0 ${colors[notification.type]}`}><Icon className="size-5" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm">{notification.title}</p>
                  <span className="text-xs text-muted-foreground shrink-0">{new Date(notification.createdAt).toLocaleString()}</span>
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
  );
}

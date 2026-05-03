import { useState } from "react";
import { notifications as initial, Notification } from "@/data/mock";
import { Bell, CheckCheck, MessageSquare, UserPlus, Zap, Settings } from "lucide-react";

const icons: Record<Notification["type"], any> = {
  invite: UserPlus, project: Zap, task: MessageSquare, system: Settings,
};
const colors: Record<Notification["type"], string> = {
  invite: "bg-primary-soft text-primary",
  project: "bg-[hsl(var(--cyan)/0.12)] text-cyan",
  task: "bg-[hsl(var(--warning)/0.12)] text-warning",
  system: "bg-secondary text-muted-foreground",
};

export default function Notifications() {
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const shown = items.filter((n) => filter === "all" || !n.read);
  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="container py-10 max-w-3xl">
      <div className="ds-card p-7 mb-6 bg-gradient-hero flex items-center justify-between">
        <div>
          <span className="ds-chip-primary"><Bell className="size-3.5" /> {unread} unread</span>
          <h1 className="ds-page-title mt-2">Notifications</h1>
        </div>
        <button onClick={() => setItems(items.map((i) => ({ ...i, read: true })))} className="h-10 px-4 rounded-xl bg-card border border-border text-sm font-semibold inline-flex items-center gap-2 hover:bg-secondary">
          <CheckCheck className="size-4" /> Mark all read
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        {(["all", "unread"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 h-9 rounded-lg text-sm font-medium capitalize transition-colors ${filter === f ? "bg-primary text-white" : "bg-card border border-border text-muted-foreground hover:bg-secondary"}`}>{f}</button>
        ))}
      </div>

      <div className="space-y-2">
        {shown.length === 0 && <div className="ds-card p-12 text-center text-muted-foreground">You're all caught up.</div>}
        {shown.map((n) => {
          const Icon = icons[n.type];
          return (
            <div key={n.id} onClick={() => setItems(items.map((i) => i.id === n.id ? { ...i, read: true } : i))} className={`ds-card p-4 flex gap-4 cursor-pointer transition-all hover:shadow-card ${!n.read ? "border-primary/30 bg-primary-soft/30" : ""}`}>
              <div className={`size-11 rounded-xl flex items-center justify-center shrink-0 ${colors[n.type]}`}><Icon className="size-5" /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-sm">{n.title}</p>
                  <span className="text-xs text-muted-foreground shrink-0">{n.time}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
              </div>
              {!n.read && <div className="size-2 rounded-full bg-primary mt-2" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { useMemo, useState, useEffect } from "react";
import { useApp } from "@/lib/store";
import { Check, X, Inbox, Send, Users, FileText, Loader2 } from "lucide-react";
import { api, getToken } from "@/lib/api";

const tabs = ["Incoming", "Sent", "Accepted", "Declined"] as const;

export default function RequestsPage() {
  const { state } = useApp();
  const me = state.currentUser;
  const [tab, setTab] = useState<(typeof tabs)[number]>("Incoming");
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersCache, setUsersCache] = useState<Record<number, any>>({});

  useEffect(() => {
    if (!getToken() || !me) {
      setLoading(false);
      return;
    }
    Promise.all([
      api.getRequests("pending").catch(() => []),
      api.getRequests("accepted").catch(() => []),
      api.getRequests("declined").catch(() => [])
    ])
    .then(([pending, accepted, declined]) => {
      const all = [...pending, ...accepted, ...declined];
      all.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
      setRequests(all);

      // We might need to fetch users involved in these requests. 
      // For now, we will rely on state.users or just show IDs if state.users is missing.
    })
    .finally(() => setLoading(false));
  }, [me]);

  const filtered = requests.filter((request) => {
    if (!me) return false;
    if (tab === "Incoming") return request.to_id === me.id && request.status === "pending";
    if (tab === "Sent") return request.from_id === me.id && request.status === "pending";
    if (tab === "Accepted") return (request.to_id === me.id || request.from_id === me.id) && request.status === "accepted";
    if (tab === "Declined") return (request.to_id === me.id || request.from_id === me.id) && request.status === "declined";
    return false;
  });

  const update = async (id: number, status: "pending" | "accepted" | "declined") => {
    try {
      await api.updateRequest(id, { status });
      setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (err) {
      console.error(err);
    }
  };

  if (!me) {
    return (
      <div className="container py-10">
        <div className="ds-card p-16 text-center">
          <div className="size-14 rounded-2xl bg-primary-soft text-primary mx-auto flex items-center justify-center mb-4">
            <Users className="size-6" />
          </div>
          <h3 className="font-semibold text-lg">Please log in</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">You must be logged in to manage your collaboration requests.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-20 flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-10 space-y-6">
      <div className="ds-card p-7 bg-gradient-hero flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="ds-chip-primary">Requests</span>
          <h1 className="ds-page-title mt-2">Collaboration inbox</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl">Manage incoming collaboration requests, sent requests, accepted connections, and declined responses in one place.</p>
        </div>
        <div className="grid grid-cols-3 gap-3 min-w-[240px]">
          <div className="ds-card p-4 text-center">
            <div className="text-2xl font-bold">{requests.filter((r) => r.to_id === me?.id && r.status === "pending").length}</div>
            <div className="text-xs text-muted-foreground">Incoming</div>
          </div>
          <div className="ds-card p-4 text-center">
            <div className="text-2xl font-bold">{requests.filter((r) => r.from_id === me?.id && r.status === "pending").length}</div>
            <div className="text-xs text-muted-foreground">Sent</div>
          </div>
          <div className="ds-card p-4 text-center">
            <div className="text-2xl font-bold">{requests.filter((r) => (r.to_id === me?.id || r.from_id === me?.id) && r.status === "accepted").length}</div>
            <div className="text-xs text-muted-foreground">Accepted</div>
          </div>
        </div>
      </div>

      <div className="ds-card p-2 inline-flex flex-wrap gap-1">
        {tabs.map((item) => (
          <button key={item} onClick={() => setTab(item)} className={`px-4 h-9 rounded-lg text-sm font-medium transition-colors ${tab === item ? "bg-primary text-white" : "text-muted-foreground hover:bg-secondary"}`}>
            {item}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length ? filtered.map((request) => {
          // Attempt to map from local state or fallback
          const from: any = state.users[request.from_id] || { name: `User ${request.from_id}` };
          const to: any = state.users[request.to_id] || { name: `User ${request.to_id}` };
          const project = request.project_id ? state.projects[request.project_id] : null;
          const isIncoming = request.to_id === me?.id;

          return (
            <div key={request.id} className="ds-card p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="size-11 rounded-2xl bg-gradient-primary text-white flex items-center justify-center font-semibold shrink-0">
                  {from?.avatar ? <img src={from.avatar} className="size-full rounded-2xl object-cover" /> : from?.name?.slice(0, 2) || "U"}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="font-semibold">
                      {isIncoming ? `${from?.name} wants to collaborate` : `Request sent to ${to?.name}`}
                      {project && <span className="text-muted-foreground font-normal">on {project.name || project.title}</span>}
                    </div>
                    <span className={`ds-chip ${request.status === "pending" ? "bg-primary-soft text-primary" : request.status === "accepted" ? "bg-success-bg text-success" : "bg-secondary text-muted-foreground"}`}>
                      {request.status}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">{request.message || "No message provided."}</div>
                  {request.role && (
                    <div className="mt-1 text-xs text-primary font-semibold uppercase tracking-wider">
                      Role Applied: {request.role}
                    </div>
                  )}
                  {request.skills && request.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {request.skills.map((s: string) => (
                        <span key={s} className="ds-chip text-[9px] py-0.5">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">{new Date(request.created_at).toLocaleString()}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isIncoming && request.status === "pending" ? (
                  <>
                    <button onClick={() => update(request.id, "accepted")} className="h-9 px-3 rounded-xl bg-primary text-white inline-flex items-center gap-2">
                      <Check className="size-4" /> Accept & Enroll
                    </button>
                    <button onClick={() => update(request.id, "declined")} className="h-9 px-3 rounded-xl bg-card border border-border inline-flex items-center gap-2">
                      <X className="size-4" /> Decline
                    </button>
                  </>
                ) : request.status === "pending" ? (
                  <button onClick={() => update(request.id, "declined")} className="h-9 px-3 rounded-xl bg-card border border-border inline-flex items-center gap-2">
                    <X className="size-4" /> Cancel
                  </button>
                ) : (
                  <div className="text-sm text-muted-foreground inline-flex items-center gap-2">
                    {request.status === "accepted" ? <Inbox className="size-4 text-success" /> : <Send className="size-4" />}
                    {request.status === "accepted" ? "Connected" : "Declined"}
                  </div>
                )}
              </div>
            </div>
          );
        }) : (
          <div className="ds-card p-16 text-center">
            <div className="size-14 rounded-2xl bg-primary-soft text-primary mx-auto flex items-center justify-center mb-4">
              <Users className="size-6" />
            </div>
            <h3 className="font-semibold text-lg">No {tab.toLowerCase()} requests</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">Requests will appear here once builders reach out or you send collaboration invites.</p>
          </div>
        )}
      </div>
    </div>
  );
}

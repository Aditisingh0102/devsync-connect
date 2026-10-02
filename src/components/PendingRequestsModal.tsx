import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { Loader2, Check, X, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useApp } from "@/lib/store";

interface PendingRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestHandled?: (increment: number) => void;
}

export default function PendingRequestsModal({ isOpen, onClose, onRequestHandled }: PendingRequestsModalProps) {
  const { state } = useApp();
  const me = state.currentUser;
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && me) {
      setLoading(true);
      api.getRequests("pending")
        .then((data) => {
          if (Array.isArray(data)) {
            // Filter only incoming pending requests
            setRequests(data.filter((r) => r.to_id === me.id && r.status === "pending"));
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isOpen, me]);

  const handleAction = async (id: number, status: "accepted" | "declined") => {
    try {
      setProcessingId(id);
      await api.updateRequest(id, { status });
      setRequests((prev) => prev.filter((r) => r.id !== id));
      if (onRequestHandled) {
        onRequestHandled(-1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-5 pb-3 border-b border-border">
          <DialogTitle className="text-xl capitalize flex items-center justify-between">
            Pending Requests
            <span className="text-sm font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{requests.length}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="size-6 animate-spin text-primary" /></div>
          ) : requests.length === 0 ? (
            <div className="text-center py-10 px-4 text-muted-foreground">
              <Users className="size-10 mx-auto mb-3 opacity-20" />
              <p>No pending requests</p>
            </div>
          ) : (
            <div className="space-y-1">
              {requests.map((request) => {
                const user = state.users[request.from_id] || { name: `User ${request.from_id}` };
                return (
                  <div key={request.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <Avatar className="size-10 shrink-0">
                        {user.avatar ? <img src={user.avatar} alt={user.name} /> : <AvatarFallback>{user.name?.slice(0, 2) || "U"}</AvatarFallback>}
                      </Avatar>
                      <div className="overflow-hidden">
                        <p className="font-semibold text-sm truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{request.role ? `Role: ${request.role}` : request.message || "Wants to collaborate"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <button 
                        disabled={processingId === request.id}
                        onClick={() => handleAction(request.id, "accepted")}
                        className="size-8 rounded-full bg-success-bg text-success flex items-center justify-center hover:bg-success hover:text-white transition-colors disabled:opacity-50"
                        title="Accept"
                      >
                        {processingId === request.id ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                      </button>
                      <button 
                        disabled={processingId === request.id}
                        onClick={() => handleAction(request.id, "declined")}
                        className="size-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive hover:text-white transition-colors disabled:opacity-50"
                        title="Decline"
                      >
                        {processingId === request.id ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

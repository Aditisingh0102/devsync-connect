import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api } from "@/lib/api";
import { Loader2, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface FollowListModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "followers" | "following";
  username: string;
  isOwnProfile: boolean;
  onCountUpdate?: (type: "followers" | "following", increment: number) => void;
}

export default function FollowListModal({ isOpen, onClose, type, username, isOwnProfile, onCountUpdate }: FollowListModalProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && username) {
      setLoading(true);
      const fetchPromise = type === "followers" ? api.getFollowers(username) : api.getFollowing(username);
      
      fetchPromise
        .then((data) => {
          if (Array.isArray(data)) setUsers(data);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isOpen, username, type]);

  const handleAction = async (userId: number) => {
    try {
      setProcessingId(userId);
      if (type === "followers") {
        await api.removeFollower(userId);
      } else {
        await api.unfollowUser(userId);
      }
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      if (onCountUpdate) {
        onCountUpdate(type, -1);
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
            {type}
            <span className="text-sm font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">{users.length}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="py-10 flex justify-center">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          ) : users.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground text-sm">
              No {type} found.
            </div>
          ) : (
            <div className="space-y-1 p-1">
              {users.map((user) => {
                const isImageAvatar = !!user.avatar && /^(data:|https?:\/\/)/.test(user.avatar);
                const initials = (user.name || user.username || "U").substring(0, 2).toUpperCase();
                
                return (
                  <div key={user.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-secondary transition-colors">
                    <Link to={/profile/\} onClick={onClose} className="flex items-center gap-3 flex-1 min-w-0 group">
                      <Avatar className="size-10 shrink-0">
                        {isImageAvatar ? (
                          <img src={user.avatar} alt={user.name} className="size-full object-cover" />
                        ) : (
                          <AvatarFallback className="bg-gradient-primary text-white text-xs font-semibold">{initials}</AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{user.name || user.username}</p>
                        <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
                      </div>
                    </Link>
                    
                    {isOwnProfile && (
                      <button
                        onClick={() => handleAction(user.id)}
                        disabled={processingId === user.id}
                        className="ml-3 shrink-0 h-8 px-3 rounded-lg text-xs font-medium bg-card border border-border hover:bg-danger/10 hover:text-danger hover:border-danger/30 transition-colors flex items-center justify-center min-w-[76px]"
                      >
                        {processingId === user.id ? <Loader2 className="size-3.5 animate-spin" /> : type === "followers" ? "Remove" : "Unfollow"}
                      </button>
                    )}
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

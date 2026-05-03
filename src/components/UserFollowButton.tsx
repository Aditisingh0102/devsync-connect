import React from "react";
import { useApp } from "@/lib/store";

export default function UserFollowButton({ userId }: { userId: string }) {
  const { state, dispatch } = useApp();
  const me = state.currentUser;
  if (!me) return null;
  const isFollowing = (me.following || []).includes(userId);

  const toggle = () => {
    if (isFollowing) dispatch({ type: "unfollow", payload: { fromId: me.id, toId: userId } });
    else dispatch({ type: "follow", payload: { fromId: me.id, toId: userId } });
  };

  return (
    <button onClick={toggle} className={`h-9 px-3 rounded-xl ${isFollowing ? "bg-card border border-border" : "bg-primary text-white"}`}>
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
}

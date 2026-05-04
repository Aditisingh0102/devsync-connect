import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "@/lib/store";

export default function Login() {
  const { state, dispatch } = useApp();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = () => {
    if (!username && !email) return setError("Enter username or email to continue");
    // Find a demo user by username or email
    const users = Object.values(state.users || {});
    let user = users.find((u: any) => (u.username && u.username.toLowerCase() === username.toLowerCase()) || (u.links && u.links.github && u.links.github.includes(username)));
    if (!user && email) user = users.find((u: any) => (u.email && u.email.toLowerCase() === email.toLowerCase()));
    if (!user) {
      // Create a lightweight guest user
      const id = `u_${Date.now()}`;
      user = { id, name: username || email, username: (username || email).split("@")[0], handle: `@${(username || email).split("@")[0]}`, avatar: (username || "G").slice(0,2).toUpperCase(), followers: [], following: [], pendingRequests: [], sentRequests: [], links: { github: "#" } } as any;
      dispatch({ type: "updateUser", payload: user });
    }
    dispatch({ type: "setCurrentUser", payload: user });
    navigate(user?.profileCompleted ? "/dashboard" : "/onboarding/profile-setup");
  };

  return (
    <div className="container py-12 max-w-md">
      <div className="ds-card p-6">
        <h2 className="font-semibold text-lg mb-2">Welcome back</h2>
        <p className="text-sm text-muted-foreground mb-4">Sign in to continue to DevSync</p>
        {error && <div className="text-sm text-danger mb-3">{error}</div>}
        <input className="ds-input mb-3" placeholder="Username or email" value={username} onChange={(e)=>setUsername(e.target.value)} />
        <input className="ds-input mb-3" placeholder="Email (optional)" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <div className="flex gap-2">
          <button onClick={submit} className="h-10 px-4 rounded-xl bg-primary text-white">Sign in</button>
          <Link to="/signup" className="h-10 px-4 rounded-xl bg-card border flex items-center">Create account</Link>
        </div>
      </div>
    </div>
  );
}

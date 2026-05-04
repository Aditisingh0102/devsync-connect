import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "@/lib/store";

export default function Signup() {
  const { dispatch } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const submit = () => {
    if (!name || !username) return;
    const id = `u_${Date.now()}`;
    const user = {
      id,
      name,
      username,
      handle: `@${username}`,
      avatar: name.split(" ").map((s)=>s[0]).slice(0,2).join("").toUpperCase(),
      email,
      profileCompleted: false,
      followers: [],
      following: [],
      pendingRequests: [],
      sentRequests: [],
      links: { github: "#" },
    } as any;
    dispatch({ type: "updateUser", payload: user });
    dispatch({ type: "setCurrentUser", payload: user });
    navigate("/onboarding/profile-setup");
  };

  return (
    <div className="container py-12 max-w-md">
      <div className="ds-card p-6">
        <h2 className="font-semibold text-lg mb-2">Create your DevSync account</h2>
        <p className="text-sm text-muted-foreground mb-4">Join DevSync to find teammates and projects.</p>
        <input className="ds-input mb-3" placeholder="Full name" value={name} onChange={(e)=>setName(e.target.value)} />
        <input className="ds-input mb-3" placeholder="Username" value={username} onChange={(e)=>setUsername(e.target.value)} />
        <input className="ds-input mb-3" placeholder="Email (optional)" value={email} onChange={(e)=>setEmail(e.target.value)} />
        <div className="flex gap-2">
          <button onClick={submit} className="h-10 px-4 rounded-xl bg-primary text-white">Create account</button>
          <Link to="/login" className="h-10 px-4 rounded-xl bg-card border flex items-center">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

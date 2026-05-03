import { Github, Linkedin, Twitter, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-20">
      <div className="container py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="size-8 rounded-lg bg-gradient-primary flex items-center justify-center"><Sparkles className="size-4 text-white" /></div>
            <span className="font-display font-bold">DevSync</span>
          </div>
          <p className="text-sm text-muted-foreground max-w-sm">
            Connect. Collaborate. Build. The student platform for real-world projects, skill-matched teams, and verified portfolios.
          </p>
          <p className="text-xs text-muted-foreground mt-4">Built by Team Byte_Forge — Aditi Singh, Anshuman, Ansh Gupta, Ambar Kumar.</p>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-3">Product</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/find-projects" className="hover:text-primary">Find Projects</Link></li>
            <li><Link to="/my-team" className="hover:text-primary">My Team</Link></li>
            <li><Link to="/profile" className="hover:text-primary">Profile</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-3">Connect</h4>
          <div className="flex gap-2">
            <a className="size-9 rounded-lg bg-secondary hover:bg-accent flex items-center justify-center" href="#"><Github className="size-4" /></a>
            <a className="size-9 rounded-lg bg-secondary hover:bg-accent flex items-center justify-center" href="#"><Linkedin className="size-4" /></a>
            <a className="size-9 rounded-lg bg-secondary hover:bg-accent flex items-center justify-center" href="#"><Twitter className="size-4" /></a>
          </div>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © 2026 DevSync · Team Byte_Forge
      </div>
    </footer>
  );
}

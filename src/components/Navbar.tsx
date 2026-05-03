import { Link, NavLink, useLocation } from "react-router-dom";
import { Bell, Search, Menu, X, Moon, Sun, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const links = [
  { to: "/", label: "Home" },
  { to: "/my-team", label: "My Team" },
  { to: "/find-projects", label: "Find Projects" },
  { to: "/profile", label: "Profile" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const loc = useLocation();

  useEffect(() => { setOpen(false); }, [loc.pathname]);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="size-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
            <Sparkles className="size-5 text-white" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight">DevSync</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1 ml-6">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? "bg-primary-soft text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex-1" />

        <div className="hidden lg:flex items-center gap-2 px-3 h-10 w-72 rounded-xl bg-secondary border border-border">
          <Search className="size-4 text-muted-foreground" />
          <input
            placeholder="Search projects, skills, teams…"
            className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
          />
        </div>

        <Link to="/notifications" className="relative size-10 rounded-xl bg-secondary hover:bg-accent flex items-center justify-center transition-colors">
          <Bell className="size-4.5" />
          <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-danger" />
        </Link>

        <button onClick={() => setDark(!dark)} className="size-10 rounded-xl bg-secondary hover:bg-accent flex items-center justify-center transition-colors" aria-label="Toggle theme">
          {dark ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="hidden md:flex items-center gap-2 pl-1 pr-3 h-10 rounded-xl bg-secondary hover:bg-accent transition-colors">
              <Avatar className="size-8"><AvatarFallback className="bg-gradient-primary text-white text-xs font-semibold">AS</AvatarFallback></Avatar>
              <span className="text-sm font-medium">Aditi</span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Aditi Singh</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild><Link to="/profile">Profile</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/my-team">My Team</Link></DropdownMenuItem>
            <DropdownMenuItem asChild><Link to="/onboarding/profile-setup">Onboarding</Link></DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button className="md:hidden size-10 rounded-xl bg-secondary flex items-center justify-center" onClick={() => setOpen(!open)}>
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-card">
          <div className="container py-3 flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive ? "bg-primary-soft text-primary" : "text-foreground hover:bg-secondary"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

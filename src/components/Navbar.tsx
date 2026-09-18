import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Bell, Search, Menu, X, Moon, Sun, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useApp } from "@/lib/store";
import { api, getToken } from "@/lib/api";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const links = [
  { to: "/", label: "Home" },
  { to: "/discover-builders", label: "Discover Builders" },
  { to: "/my-projects", label: "My Projects" },
  { to: "/my-team", label: "My Team" },
  { to: "/find-projects", label: "Find Projects" },
  { to: "/profile", label: "Profile" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const { resolvedTheme, setTheme } = useTheme();
  const { state, dispatch } = useApp();
  const currentUser = state.currentUser;
  const navigate = useNavigate();
  const isImageAvatar = !!currentUser?.avatar && /^(data:|https?:\/\/)/.test(currentUser.avatar);
  const getInitials = (u: any) => {
    if (u?.name) return u.name.split(" ").map((s: string) => s[0]).slice(0, 2).join("").toUpperCase();
    return (u?.username || "U").substring(0, 2).toUpperCase();
  };
  const avatar = isImageAvatar ? currentUser.avatar : getInitials(currentUser);
  const isDark = resolvedTheme === "dark";

  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  useEffect(() => {
    if (currentUser && getToken()) {
      api.getNotifications(true)
        .then(data => {
          if (Array.isArray(data)) {
            setUnreadNotificationsCount(data.length);
          }
        })
        .catch(() => {});
    }
  }, [currentUser]);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setSearchQuery(q);
  }, [searchParams]);

  const handleInputChange = (val: string) => {
    setSearchQuery(val);
    const cleanVal = val.trim();
    const newParams = new URLSearchParams(searchParams);
    if (cleanVal) {
      newParams.set("q", cleanVal);
    } else {
      newParams.delete("q");
    }

    if (loc.pathname === "/discover-builders" || loc.pathname === "/find-builders" || loc.pathname === "/find-projects") {
      navigate(`${loc.pathname}?${newParams.toString()}`, { replace: true });
    } else {
      if (cleanVal) {
        navigate(`/find-projects?${newParams.toString()}`);
      }
    }
  };

  useEffect(() => { setOpen(false); }, [loc.pathname]);

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
                `px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-primary-soft text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex-1" />

        <div className="hidden lg:flex items-center gap-2 px-3 h-10 w-72 rounded-xl bg-secondary border border-border focus-within:border-primary/50 transition-colors">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={searchQuery}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Search skills, tech (use , for multiple)…"
            className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
          />
        </div>

        <Link to="/notifications" className="relative size-10 rounded-xl bg-secondary hover:bg-accent flex items-center justify-center transition-colors">
          <Bell className="size-4.5" />
          {(() => {
            const unreadCount = unreadNotificationsCount;
            if (!unreadCount) return null;
            return (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white shadow-sm ring-2 ring-background">
                {unreadCount}
              </span>
            );
          })()}
        </Link>

        <button onClick={() => setTheme(isDark ? "light" : "dark")} className="size-10 rounded-xl bg-secondary hover:bg-accent flex items-center justify-center transition-colors" aria-label="Toggle theme">
          {isDark ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            {currentUser ? (
              <button className="hidden md:flex items-center gap-2 pl-1 pr-3 h-10 rounded-xl bg-secondary hover:bg-accent transition-colors">
                <Avatar className="size-8 overflow-hidden">
                  {isImageAvatar ? <img src={avatar} alt={currentUser?.name || "Profile"} className="size-full object-cover" /> : <AvatarFallback className="bg-gradient-primary text-white text-xs font-semibold">{avatar}</AvatarFallback>}
                </Avatar>
                <span className="text-sm font-medium">{currentUser?.name || currentUser?.username}</span>
              </button>
            ) : (
              <Link to="/login" className="hidden md:flex items-center gap-2 pl-3 pr-3 h-10 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-hover transition-colors">
                Login
              </Link>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Hello! {currentUser?.name || "Guest"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {currentUser ? (
              <>
                <DropdownMenuItem asChild><Link to="/dashboard">Dashboard</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/profile">Profile</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/settings">Settings</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/feed">Collaboration Feed</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/my-projects">My Projects</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/my-team">My Team</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/profile?tab=Saved">Saved</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/profile?tab=Network">Following</Link></DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <button
                    className="w-full text-left"
                    onClick={() => {
                      dispatch({ type: "setCurrentUser" });
                      navigate("/");
                    }}
                  >
                    Sign out
                  </button>
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem asChild><Link to="/login">Login</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/signup">Sign Up</Link></DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
}


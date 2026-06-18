import { NavLink, Outlet } from "react-router-dom";
import { Home, Search, PlusSquare, Bell, User } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useApp } from "@/lib/store";

export default function Layout() {
  const { state } = useApp();
  const unreadCount = state.currentUser && state.notifications ? Object.values(state.notifications).filter((n) => !n.read).length : 0;

  return (
    <div className="min-h-screen flex flex-col bg-background pb-16 md:pb-0">
      <Navbar />
      <main className="flex-1"><Outlet /></main>
      <Footer />
      
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border/70">
        <div className="flex items-center justify-around h-16 px-2 pb-safe">
          <NavLink to="/" end className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
            <Home className="size-5" />
            <span className="text-[10px] font-semibold">Home</span>
          </NavLink>
          
          <NavLink to="/find-projects" className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
            <Search className="size-5" />
            <span className="text-[10px] font-semibold">Search</span>
          </NavLink>
          
          <NavLink to="/feed" className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
            <PlusSquare className="size-5" />
            <span className="text-[10px] font-semibold">Post</span>
          </NavLink>
          
          <NavLink to="/notifications" className={({ isActive }) => `relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
            <div className="relative">
              <Bell className="size-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-1 text-[8px] font-bold text-white shadow-sm ring-2 ring-background">
                  {unreadCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold">Alerts</span>
          </NavLink>
          
          <NavLink to="/profile" className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
            <User className="size-5" />
            <span className="text-[10px] font-semibold">Profile</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
}

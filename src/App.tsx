import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import FindProjects from "./pages/FindProjects";
import MyTeam from "./pages/MyTeam";
import Profile from "./pages/Profile";
import ProjectDetail from "./pages/ProjectDetail";
import TeamDetail from "./pages/TeamDetail";
import Notifications from "./pages/Notifications";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/find-projects" element={<FindProjects />} />
            <Route path="/my-team" element={<MyTeam />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/team/:id" element={<TeamDetail />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/onboarding/profile-setup" element={<Onboarding />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

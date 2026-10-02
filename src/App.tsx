import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import DiscoverBuilders from "./pages/DiscoverBuilders";
import FindProjects from "./pages/FindProjects";
import MyProjects from "./pages/MyProjects";
import MyTeam from "./pages/MyTeam";
import Profile from "./pages/Profile";
import ProjectDetail from "./pages/ProjectDetail";
import TeamDetail from "./pages/TeamDetail";
import Notifications from "./pages/Notifications";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import FeedPage from "./pages/FeedPage";
import PostPage from "./pages/PostPage";
import RequestsPage from "./pages/Requests";
import ReviewsPage from "./pages/Reviews";
import SettingsPage from "./pages/Settings";
import EditProfilePage from "./pages/EditProfilePage";
import ProfileNetwork from "./pages/ProfileNetwork";
import ProfilePosts from "./pages/ProfilePosts";
import { AppProvider } from "@/lib/store";
import ErrorBoundary from "@/components/ErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppProvider>
      <ErrorBoundary>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/discover-builders" element={<DiscoverBuilders />} />
            <Route path="/find-projects" element={<FindProjects />} />
            <Route path="/my-projects" element={<MyProjects />} />
            <Route path="/find-builders" element={<DiscoverBuilders />} />
            <Route path="/my-team" element={<MyTeam />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/:id" element={<Profile />} />
            <Route path="/profile/edit" element={<EditProfilePage />} />
            <Route path="/profile/network" element={<ProfileNetwork />} />
            <Route path="/profile/posts" element={<ProfilePosts />} />
            <Route path="/profile/requests" element={<RequestsPage />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/team/:id" element={<TeamDetail />} />
            <Route path="/post/:id" element={<PostPage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/reviews" element={<ReviewsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/onboarding/profile-setup" element={<Onboarding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </HashRouter>
      </ErrorBoundary>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

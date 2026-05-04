import React, { createContext, useContext, useReducer, useEffect } from "react";
import type { AppState, AppAction, AppNotification, User, Post, Response, Review, Request } from "./types";

// Persistence helpers
const STORAGE_KEY = "devsync_app_state_v2";

function loadState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to load state from localStorage:", error);
  }
  return getInitialState();
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error("Failed to save state to localStorage:", error);
  }
}

function getInitialState(): AppState {
  const users: Record<string, User> = {};
  const posts: Record<string, Post> = {};
  const reviews: Record<string, Review> = {};

  const seed = [
    { id: "u_priya", name: "Priya Mehta", username: "priyam", college: "IIT Delhi", bio: "ML student building dev tools for students.", skills: ["Python","FastAPI","ML"], domains: ["AI/ML"], roles: ["ML Engineer"], links: { github: "#", linkedin: "#" } },
    { id: "u_rohan", name: "Rohan Verma", username: "rohanv", college: "BITS Pilani", bio: "Frontend dev, design-curious, hackathon regular.", skills: ["React","TS","Tailwind"], domains: ["Frontend"], roles: ["Frontend Dev"], links: { github: "#" } },
    { id: "u_sarah", name: "Sarah Khan", username: "sarahk", college: "VIT Vellore", bio: "Backend + cloud. Loves clean APIs.", skills: ["Node","PostgreSQL","AWS"], domains: ["Backend"], roles: ["Backend Dev"], links: { github: "#" } },
    { id: "u_jordan", name: "Jordan Lee", username: "jordanl", college: "NIT Trichy", bio: "Full stack builder shipping side projects weekly.", skills: ["Next.js","Supabase"], domains: ["Full Stack"], roles: ["Full Stack"], links: { github: "#" } },
    { id: "u_neha", name: "Neha Sharma", username: "nehas", college: "IIIT Hyderabad", bio: "UI/UX designer who codes prototypes in React.", skills: ["Figma","React","Motion"], domains: ["UI/UX"], roles: ["Designer"], links: { portfolio: "#" } },
    { id: "u_aarav", name: "Aarav Gupta", username: "aaravg", college: "DTU", bio: "Open source enthusiast, DevOps in training.", skills: ["Docker","K8s","Go"], domains: ["DevOps"], roles: ["DevOps"], links: { github: "#" } },
  ];
  for (const u of seed) users[u.id] = { ...u, followers: [], following: [], pendingRequests: [], sentRequests: [] };

  const samplePosts = [
    { authorId: "u_priya", title: "Looking for frontend dev for hackathon team", body: "Building a student match engine for HackX. Need a React dev comfortable with Tailwind. 2-week sprint.", type: "Hiring for Hackathon", domain: "Frontend", tech: ["React","Tailwind"], projectType: "Hackathon" },
    { authorId: "u_rohan", title: "Need backend contributor for PeerCode Review Hub", body: "Async code review platform for student projects. Looking for Node + Postgres collaborator.", type: "Seeking Contributor", domain: "Backend", tech: ["Node","PostgreSQL"], projectType: "Open Source" },
    { authorId: "u_neha", title: "Open to join a final year project (UI/UX)", body: "Final-year student designer open to join a serious FYP team. Strong Figma + prototyping.", type: "Open to Join", domain: "UI/UX", tech: ["Figma"], projectType: "Final Year Project" },
    { authorId: "u_jordan", title: "Project Update: StudySprint shipped v0.2", body: "Sprint planner for student teams now supports recurring sessions and quick check-ins.", type: "Project Update", domain: "Full Stack", tech: ["Next.js","Supabase"], projectType: "Service" },
  ];
  for (let i = 0; i < samplePosts.length; i++) {
    const sp: any = samplePosts[i];
    const id = `p_seed_${i}`;
    posts[id] = { id, authorId: sp.authorId, title: sp.title, body: sp.body, type: sp.type, domain: sp.domain, tech: sp.tech, projectType: sp.projectType, createdAt: new Date(Date.now() - (i+1)*3600_000).toISOString(), status: "open", responses: [] };
  }

  reviews["rv_1"] = { id: "rv_1", reviewerId: "u_rohan", subjectId: "u_priya", rating: 5, text: "Excellent collaborator, shipped fast and communicated clearly.", createdAt: new Date().toISOString() };
  reviews["rv_2"] = { id: "rv_2", reviewerId: "u_sarah", subjectId: "u_priya", rating: 4, text: "Strong ML chops, great team energy.", createdAt: new Date().toISOString() };

  return {
    currentUser: undefined,
    users,
    posts,
    responses: {},
    reviews,
    requests: {},
    notifications: {},
  };
}

// Notification helper
function createNotification(input: Partial<AppNotification> & Pick<AppNotification, "title" | "body" | "type">): AppNotification {
  return {
    id: input.id || `n_${Date.now()}_${Math.round(Math.random() * 1000)}`,
    type: input.type,
    title: input.title,
    body: input.body,
    createdAt: input.createdAt || new Date().toISOString(),
    read: input.read ?? false,
    href: input.href,
  };
}

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "setCurrentUser":
      if (!action.payload) return { ...state, currentUser: undefined };
      return { ...state, currentUser: action.payload, users: { ...state.users, [action.payload.id]: action.payload } };
    case "createPost": {
      const p = action.payload as Post;
      return {
        ...state,
        posts: { ...state.posts, [p.id]: p },
        notifications: {
          ...state.notifications,
          [p.id.replace(/^p_/, "n_post_")]: createNotification({
            type: "project",
            title: "Post published",
            body: `Your post \"${p.title}\" is now live in the collaboration feed.`,
            href: "/feed",
          }),
        },
      };
    }
    case "createResponse": {
      const r = action.payload as Response;
      return {
        ...state,
        responses: { ...state.responses, [r.id]: r },
        posts: { ...state.posts, [r.postId]: { ...(state.posts[r.postId] || {}), responses: [...((state.posts[r.postId] && state.posts[r.postId].responses) || []), r.id] } as any },
      };
    }
    case "follow": {
      const { fromId, toId } = action.payload;
      const from = state.users[fromId];
      const to = state.users[toId];
      if (!from || !to) return state;
      return {
        ...state,
        notifications: {
          ...state.notifications,
          [`n_follow_${Date.now()}`]: createNotification({
            type: "follow",
            title: `You followed ${to.name}`,
            body: `You're now following ${to.name} to keep up with their collaborations.`,
            href: `/profile/${toId}`,
          }),
        },
        users: {
          ...state.users,
          [fromId]: { ...from, following: Array.from(new Set([...(from.following || []), toId])) },
          [toId]: { ...to, followers: Array.from(new Set([...(to.followers || []), fromId])) },
        },
      };
    }
    case "unfollow": {
      const { fromId, toId } = action.payload;
      const from = state.users[fromId];
      const to = state.users[toId];
      if (!from || !to) return state;
      return {
        ...state,
        users: {
          ...state.users,
          [fromId]: { ...from, following: (from.following || []).filter((x) => x !== toId) },
          [toId]: { ...to, followers: (to.followers || []).filter((x) => x !== fromId) },
        },
      };
    }
    case "sendRequest": {
      const req = action.payload;
      return {
        ...state,
        requests: { ...state.requests, [req.id]: req },
        notifications: {
          ...state.notifications,
          [`n_req_${req.id}`]: createNotification({
            type: "request",
            title: "Collaboration request sent",
            body: `Your collaboration request was sent to ${state.users[req.toId]?.name || "a builder"}.`,
            href: "/requests",
          }),
        },
        users: {
          ...state.users,
          [req.toId]: { ...state.users[req.toId], pendingRequests: [...((state.users[req.toId] && state.users[req.toId].pendingRequests) || []), req.id] },
          [req.fromId]: { ...state.users[req.fromId], sentRequests: [...((state.users[req.fromId] && state.users[req.fromId].sentRequests) || []), req.id] },
        },
      };
    }
    case "updateRequest": {
      const { id, status } = action.payload as any;
      const req = state.requests[id];
      if (!req) return state;
      const updated = { ...req, status } as any;
      const users = { ...state.users };
      // remove from pending/sent arrays if accepted/declined
      if (status !== "pending") {
        users[req.toId] = { ...users[req.toId], pendingRequests: (users[req.toId].pendingRequests || []).filter((x) => x !== id) };
        users[req.fromId] = { ...users[req.fromId], sentRequests: (users[req.fromId].sentRequests || []).filter((x) => x !== id) };
      }
      if (status === "accepted") {
        const from = users[req.fromId];
        const to = users[req.toId];
        if (from && to) {
          users[req.fromId] = { ...from, following: Array.from(new Set([...(from.following || []), req.toId])) };
          users[req.toId] = { ...to, followers: Array.from(new Set([...(to.followers || []), req.fromId])) };
        }
      }
      return {
        ...state,
        requests: { ...state.requests, [id]: updated },
        users,
        notifications: {
          ...state.notifications,
          [`n_req_update_${id}`]: createNotification({
            type: status === "accepted" ? "request" : "system",
            title: status === "accepted" ? "Request accepted" : "Request declined",
            body: status === "accepted" ? `${state.users[req.fromId]?.name || "A builder"} accepted your collaboration request.` : `${state.users[req.toId]?.name || "A builder"} declined the collaboration request.`,
            href: "/requests",
          }),
        },
      };
    }
    case "updateUser": {
      const u = action.payload;
      return { ...state, users: { ...state.users, [u.id]: u }, currentUser: state.currentUser && state.currentUser.id === u.id ? u : state.currentUser };
    }
    case "addReview": {
      const r = action.payload as Review;
      return {
        ...state,
        reviews: { ...state.reviews, [r.id]: r },
        notifications: {
          ...state.notifications,
          [`n_review_${r.id}`]: createNotification({
            type: "review",
            title: "New review added",
            body: `A review was published for ${state.users[r.subjectId]?.name || "a collaborator"}.`,
            href: "/reviews",
          }),
        },
      };
    }
    case "addNotification": {
      const notification = action.payload;
      return { ...state, notifications: { ...state.notifications, [notification.id]: notification } };
    }
    case "markNotificationRead": {
      const { id } = action.payload;
      const item = state.notifications[id];
      if (!item) return state;
      return { ...state, notifications: { ...state.notifications, [id]: { ...item, read: true } } };
    }
    case "markAllNotificationsRead": {
      return {
        ...state,
        notifications: Object.fromEntries(Object.entries(state.notifications).map(([key, value]) => [key, { ...value, read: true }])) as Record<string, AppNotification>,
      };
    }
    default:
      return state;
  }
}

// Context and Provider
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}>({ state: getInitialState(), dispatch: () => null });

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);

// Draft helpers
export function createPostDraft(input: Partial<Post>): Post {
  return {
    id: `p_${Date.now()}_${Math.round(Math.random() * 1000)}`,
    authorId: input.authorId || "",
    title: input.title || "Untitled",
    body: input.body || "",
    type: (input.type as any) || "Looking for Team",
    domain: input.domain,
    tech: input.tech || [],
    projectType: input.projectType,
    lookingFor: input.lookingFor,
    createdAt: new Date().toISOString(),
    status: input.status || "open",
    responses: [],
  };
}

export function createResponseDraft(input: Partial<Response>): Response {
  return {
    id: `r_${Date.now()}_${Math.round(Math.random() * 1000)}`,
    postId: input.postId || "",
    fromId: input.fromId || "",
    message: input.message || "",
    skillsSummary: input.skillsSummary || [],
    resumeUrl: input.resumeUrl,
    createdAt: new Date().toISOString(),
    status: "pending",
  };
}

export default AppContext;

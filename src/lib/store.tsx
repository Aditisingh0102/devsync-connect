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
  // Seed demo users and posts to make the app feel multi-user and alive
  const demoUsers: Record<string, User> = {};
  const names = ["Priya Mehta", "Rohan Verma", "Alex Carter", "Sarah Khan", "Jordan Lee", "Neha Sharma", "Aarav Gupta"];
  names.forEach((n, i) => {
    const id = `u_${i + 1}`;
    demoUsers[id] = {
      id,
      name: n,
      username: `${n.split(" ")[0].toLowerCase()}${Math.floor(100 + Math.random() * 900)}`,
      handle: `@${n.split(" ")[0].toLowerCase()}`,
      avatar: n.split(" ").map((s) => s[0]).slice(0, 2).join("") ,
      bio: "Building useful projects and collaborating with college teams.",
      college: `Institute of Technology ${Math.floor(1 + Math.random() * 10)}`,
      skills: ["React", "Node", "Python"].slice(0, 2 + (i % 2)),
      roles: ["Frontend", "Full Stack"].slice(0, 1 + (i % 2)),
      domains: ["Web", "AI", "OpenSource"].slice(0, 1 + (i % 3)),
      links: { github: "https://github.com/example", linkedin: "https://linkedin.com/", portfolio: "https://example.com" },
      followers: [],
      following: [],
      pendingRequests: [],
      sentRequests: [],
      profileCompleted: true,
    } as User;
  });

  const demoPosts: Record<string, Post> = {};
  const sample = [
    { authorIndex: 0, title: "Looking for Frontend for HackPrep Planner", body: "Building a dashboard to help students prepare for hackathons. Need a frontend dev.", type: "Looking for Team" },
    { authorIndex: 1, title: "Need ML help for PeerCode Review Hub", body: "Seeking an ML engineer to help build code quality suggestions.", type: "Seeking Contributor" },
    { authorIndex: 2, title: "Open to Collaborate on Campus Connect Live", body: "Working on a live events platform for college clubs.", type: "Open to Join" },
  ];
  sample.forEach((s, idx) => {
    const id = `p_${idx + 1}`;
    const authorId = `u_${s.authorIndex + 1}`;
    demoPosts[id] = {
      id,
      authorId,
      title: s.title,
      body: s.body,
      type: s.type as any,
      domain: idx % 2 === 0 ? "Frontend" : "AI/ML",
      tech: idx % 2 === 0 ? ["React", "TypeScript"] : ["Python", "PyTorch"],
      projectType: idx % 2 === 0 ? "Hackathon" : "Open Source",
      lookingFor: "Frontend, Designer",
      createdAt: new Date(Date.now() - (idx * 1000 * 60 * 60 * 24)).toISOString(),
      status: "open",
      responses: [],
    } as Post;
  });

  return {
    currentUser: undefined,
    users: demoUsers,
    posts: demoPosts,
    responses: {},
    reviews: {},
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
      const author = state.users[p.authorId] || state.currentUser;
      return {
        ...state,
        posts: { ...state.posts, [p.id]: p },
        users: author ? {
          ...state.users,
          [author.id]: { ...author, profileCompleted: true },
        } : state.users,
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

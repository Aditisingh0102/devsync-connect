import React, { createContext, useContext, useReducer, useEffect } from "react";
import type { AppState, AppAction, AppNotification, User, Post, Response, Review, Request, Project } from "./types";
import { projects as mockProjects } from "../data/mock";

// Persistence helpers
const STORAGE_KEY = "devsync_app_state_v3";

function loadState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const defaults = getInitialState();
      const mergedState = {
        ...defaults,
        ...parsed,
        projects: parsed.projects && Object.keys(parsed.projects).length > 0 ? parsed.projects : defaults.projects,
      };

      // Auto-migrate: Scan existing posts to auto-initialize project workspaces if missing
      if (mergedState.posts) {
        Object.values(mergedState.posts).forEach((p) => {
          try {
            if (p && p.id && p.projectName) {
              const projId = `proj_${p.id.replace(/^p_/, "")}`;
              if (mergedState.projects && !mergedState.projects[projId]) {
                const author = (mergedState.users && p.authorId && mergedState.users[p.authorId]) || mergedState.currentUser;
                mergedState.projects[projId] = {
                  id: projId,
                  title: p.projectName,
                  owner: author?.name || "Unknown User",
                  ownerId: p.authorId,
                  team: `${author?.name || "Unknown User"}'s Core Team`,
                  description: p.body || "",
                  tech: p.tech || [],
                  roles: Array.isArray(p.lookingFor) ? p.lookingFor : [],
                  members: 1,
                  maxMembers: 4,
                  progress: 0,
                  status: "Recruiting",
                  category: p.projectType || "Web",
                };
              }
            }
          } catch (e) {
            console.error("Error migrating post to project workspace during loadState:", p, e);
          }
        });
      }

      // Robust migration: Ensure all projects have an ownerId
      if (mergedState.projects) {
        Object.keys(mergedState.projects).forEach((id) => {
          try {
            const proj = mergedState.projects[id];
            if (proj && !proj.ownerId) {
              // Try matching by post author first if it was generated from a post
              const possiblePostId = `p_${id.replace(/^proj_/, "")}`;
              const post = mergedState.posts && mergedState.posts[possiblePostId];
              if (post && post.authorId) {
                proj.ownerId = post.authorId;
              } else if (proj.owner) {
                // Otherwise try matching by owner name in users list
                const matchedUser = Object.values(mergedState.users || {}).find(
                  (u) => u && u.name && proj.owner && u.name.toLowerCase() === proj.owner.toLowerCase()
                );
                if (matchedUser) {
                  proj.ownerId = matchedUser.id;
                } else if (mergedState.currentUser && mergedState.currentUser.name && proj.owner && mergedState.currentUser.name.toLowerCase() === proj.owner.toLowerCase()) {
                  proj.ownerId = mergedState.currentUser.id;
                }
              }
            }
          } catch (e) {
            console.error("Error migrating ownerId for project ID during loadState:", id, e);
          }
        });
      }

      return mergedState;
    }
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
    { authorIndex: 0, title: "Looking for Frontend for HackPrep Planner", body: "Building a dashboard to help students prepare for hackathons. Need a frontend dev.", type: "Looking for Team", projectName: "HackPrep Planner" },
    { authorIndex: 1, title: "Need ML help for PeerCode Review Hub", body: "Seeking an ML engineer to help build code quality suggestions.", type: "Seeking Contributor", projectName: "PeerCode Review Hub" },
    { authorIndex: 2, title: "Open to Collaborate on Campus Connect Live", body: "Working on a live events platform for college clubs.", type: "Open to Join", projectName: "Campus Connect Live" },
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
      projectName: s.projectName,
      domain: idx % 2 === 0 ? "Frontend" : "AI/ML",
      tech: idx % 2 === 0 ? ["React", "TypeScript"] : ["Python", "PyTorch"],
      projectType: idx % 2 === 0 ? "Hackathon" : "Open Source",
      lookingFor: "Frontend, Designer",
      createdAt: new Date(Date.now() - (idx * 1000 * 60 * 60 * 24)).toISOString(),
      status: "open",
      responses: [],
    } as Post;
  });

  const demoProjects: Record<string, Project> = {};
  const ownerNameToId: Record<string, string> = {
    "Priya Mehta": "u_1",
    "Rohan Verma": "u_2",
    "Alex Carter": "u_3",
    "Sarah Khan": "u_4",
    "Jordan Lee": "u_5",
  };
  mockProjects.forEach((p) => {
    demoProjects[p.id] = {
      ...p,
      ownerId: ownerNameToId[p.owner],
      status: p.status as any,
    };
  });

  return {
    currentUser: undefined,
    users: demoUsers,
    posts: demoPosts,
    projects: demoProjects,
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

      const newProjects = { ...state.projects };
      if (p.projectName) {
        const projId = `proj_${p.id.replace(/^p_/, "")}`;
        newProjects[projId] = {
          id: projId,
          title: p.projectName,
          owner: author?.name || "Unknown User",
          ownerId: author?.id || p.authorId,
          team: `${author?.name || "Unknown User"}'s Core Team`,
          description: p.body,
          tech: p.tech || [],
          roles: Array.isArray(p.lookingFor) ? p.lookingFor : [],
          members: 1,
          maxMembers: 4,
          progress: 0,
          status: "Recruiting",
          category: p.projectType || "Web",
          visibility: p.visibility || "public",
        };
      }

      return {
        ...state,
        posts: { ...state.posts, [p.id]: p },
        projects: newProjects,
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
      const updatedFrom = { ...from, following: Array.from(new Set([...(from.following || []), toId])) };
      const updatedTo = { ...to, followers: Array.from(new Set([...(to.followers || []), fromId])) };
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
        currentUser: state.currentUser && state.currentUser.id === fromId ? updatedFrom : state.currentUser,
        users: {
          ...state.users,
          [fromId]: updatedFrom,
          [toId]: updatedTo,
        },
      };
    }
    case "unfollow": {
      const { fromId, toId } = action.payload;
      const from = state.users[fromId];
      const to = state.users[toId];
      if (!from || !to) return state;
      const updatedFrom = { ...from, following: (from.following || []).filter((x) => x !== toId) };
      const updatedTo = { ...to, followers: (to.followers || []).filter((x) => x !== fromId) };
      return {
        ...state,
        currentUser: state.currentUser && state.currentUser.id === fromId ? updatedFrom : state.currentUser,
        users: {
          ...state.users,
          [fromId]: updatedFrom,
          [toId]: updatedTo,
        },
      };
    }
    case "sendRequest": {
      const req = action.payload;
      const fromUser = state.users[req.fromId];
      const toUser = state.users[req.toId];
      if (!fromUser || !toUser) return state;

      const updatedFrom = { ...fromUser, sentRequests: Array.from(new Set([...(fromUser.sentRequests || []), req.id])) };
      const updatedTo = { ...toUser, pendingRequests: Array.from(new Set([...(toUser.pendingRequests || []), req.id])) };

      return {
        ...state,
        requests: { ...state.requests, [req.id]: req },
        notifications: {
          ...state.notifications,
          [`n_req_${req.id}`]: createNotification({
            type: "request",
            title: "Collaboration request sent",
            body: `Your collaboration request was sent to ${toUser.name || "a builder"}.`,
            href: "/requests",
          }),
        },
        currentUser: state.currentUser && state.currentUser.id === req.fromId ? updatedFrom : (state.currentUser && state.currentUser.id === req.toId ? updatedTo : state.currentUser),
        users: {
          ...state.users,
          [req.fromId]: updatedFrom,
          [req.toId]: updatedTo,
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
        if (users[req.toId]) {
          users[req.toId] = { ...users[req.toId], pendingRequests: (users[req.toId].pendingRequests || []).filter((x) => x !== id) };
        }
        if (users[req.fromId]) {
          users[req.fromId] = { ...users[req.fromId], sentRequests: (users[req.fromId].sentRequests || []).filter((x) => x !== id) };
        }
      }
      let updatedProjects = state.projects;
      if (status === "accepted") {
        const from = users[req.fromId];
        const to = users[req.toId];
        if (from && to) {
          users[req.fromId] = { ...from, following: Array.from(new Set([...(from.following || []), req.toId])) };
          users[req.toId] = { ...to, followers: Array.from(new Set([...(to.followers || []), req.fromId])) };
        }

        if (req.projectId && state.projects[req.projectId]) {
          const proj = state.projects[req.projectId];
          if (proj.members < proj.maxMembers) {
            updatedProjects = {
              ...state.projects,
              [req.projectId]: {
                ...proj,
                members: proj.members + 1,
              },
            };
          }
        }
      }

      const updatedCurrentUser = state.currentUser
        ? (users[state.currentUser.id] || state.currentUser)
        : state.currentUser;

      return {
        ...state,
        requests: { ...state.requests, [id]: updated },
        users,
        currentUser: updatedCurrentUser,
        projects: updatedProjects,
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
    case "toggleSavePost": {
      if (!state.currentUser) return state;
      const { postId } = action.payload;
      const saved = state.currentUser.savedPosts || [];
      const updatedSaved = saved.includes(postId)
        ? saved.filter((id) => id !== postId)
        : [...saved, postId];
      const updatedUser = { ...state.currentUser, savedPosts: updatedSaved };
      return {
        ...state,
        currentUser: updatedUser,
        users: { ...state.users, [updatedUser.id]: updatedUser },
      };
    }
    case "toggleSaveBuilder": {
      if (!state.currentUser) return state;
      const { builderId } = action.payload;
      const saved = state.currentUser.savedBuilders || [];
      const updatedSaved = saved.includes(builderId)
        ? saved.filter((id) => id !== builderId)
        : [...saved, builderId];
      const updatedUser = { ...state.currentUser, savedBuilders: updatedSaved };
      return {
        ...state,
        currentUser: updatedUser,
        users: { ...state.users, [updatedUser.id]: updatedUser },
      };
    }
    case "deletePost": {
      const { postId } = action.payload;
      const newPosts = { ...state.posts };
      delete newPosts[postId];

      // Also delete the associated project workspace if it was auto-created from this post
      const newProjects = { ...state.projects };
      const projId = postId && typeof postId === "string" ? `proj_${postId.replace(/^p_/, "")}` : "";
      if (projId && newProjects[projId]) {
        delete newProjects[projId];
      }

      // Remove from savedPosts list of all users
      const updatedUsers = { ...state.users };
      Object.keys(updatedUsers).forEach((userId) => {
        const user = updatedUsers[userId];
        if (user.savedPosts?.includes(postId)) {
          updatedUsers[userId] = {
            ...user,
            savedPosts: user.savedPosts.filter((id) => id !== postId),
          };
        }
      });

      const updatedCurrentUser = state.currentUser
        ? {
            ...state.currentUser,
            savedPosts: (state.currentUser.savedPosts || []).filter((id) => id !== postId),
          }
        : state.currentUser;

      return {
        ...state,
        posts: newPosts,
        projects: newProjects,
        users: updatedUsers,
        currentUser: updatedCurrentUser,
      };
    }
    case "createProject": {
      const p = action.payload;
      return {
        ...state,
        projects: { ...state.projects, [p.id]: p },
      };
    }
    case "updateProject": {
      const p = action.payload;
      return {
        ...state,
        projects: { ...state.projects, [p.id]: p },
      };
    }
    case "deleteProject": {
      const { projectId } = action.payload;
      const newProjects = { ...state.projects };
      delete newProjects[projectId];

      // Cascade delete: if this project was created from a post, delete that post as well
      const newPosts = { ...state.posts };
      const postId = projectId && typeof projectId === "string" ? `p_${projectId.replace(/^proj_/, "")}` : "";
      delete newPosts[postId];

      // Clean up savedPosts list of all users for the deleted post
      const updatedUsers = { ...state.users };
      if (postId) {
        Object.keys(updatedUsers).forEach((userId) => {
          const user = updatedUsers[userId];
          if (user.savedPosts?.includes(postId)) {
            updatedUsers[userId] = {
              ...user,
              savedPosts: user.savedPosts.filter((id) => id !== postId),
            };
          }
        });
      }

      const updatedCurrentUser = state.currentUser && postId
        ? {
            ...state.currentUser,
            savedPosts: (state.currentUser.savedPosts || []).filter((id) => id !== postId),
          }
        : state.currentUser;

      return {
        ...state,
        projects: newProjects,
        posts: newPosts,
        users: updatedUsers,
        currentUser: updatedCurrentUser,
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
    projectName: input.projectName,
    domain: input.domain,
    tech: input.tech || [],
    projectType: input.projectType,
    lookingFor: input.lookingFor,
    createdAt: new Date().toISOString(),
    status: input.status || "open",
    visibility: input.visibility || "public",
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

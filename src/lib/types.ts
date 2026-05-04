export type ID = string;

export type User = {
  id: ID;
  name: string;
  username?: string;
  email?: string;
  handle?: string;
  avatar?: string;
  bio?: string;
  college?: string;
  skills?: string[];
  roles?: string[];
  domains?: string[];
  links?: { github?: string; linkedin?: string; portfolio?: string };
  followers?: ID[];
  following?: ID[];
  pendingRequests?: ID[]; // incoming request ids
  sentRequests?: ID[]; // sent request ids
  profileCompleted?: boolean;
  preferences?: {
    profileVisibility?: "public" | "team-only";
    emailNotifications?: boolean;
    collaborationAlerts?: boolean;
    discoverable?: boolean;
  };
};

export type PostType =
  | "Looking for Team"
  | "Seeking Contributor"
  | "Open to Join"
  | "Project Update"
  | "Hiring for Hackathon"
  | "Final Year Project Need"
  | "Open Source Collaboration"
  | "Resource Share";

export type Post = {
  id: ID;
  authorId: ID;
  title: string;
  body: string;
  type: PostType;
  domain?: string;
  tech?: string[];
  projectType?: string;
  lookingFor?: string;
  imageUrl?: string;
  referenceLink?: string;
  createdAt: string;
  status?: "open" | "closed" | "filled";
  responses?: ID[];
};

export type Response = {
  id: ID;
  postId: ID;
  fromId: ID;
  message: string;
  skillsSummary?: string[];
  resumeUrl?: string; // mock
  createdAt: string;
  status?: "pending" | "accepted" | "declined";
};

export type Review = {
  id: ID;
  reviewerId: ID;
  subjectId: ID;
  projectId?: ID;
  rating: number;
  text?: string;
  createdAt: string;
};

export type Request = {
  id: ID;
  fromId: ID;
  toId: ID;
  message?: string;
  status: "pending" | "accepted" | "declined";
  createdAt: string;
};

export type AppNotification = {
  id: ID;
  type: "invite" | "project" | "task" | "system" | "request" | "follow" | "review";
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  href?: string;
};

export type AppState = {
  currentUser?: User;
  users: Record<ID, User>;
  posts: Record<ID, Post>;
  responses: Record<ID, Response>;
  reviews: Record<ID, Review>;
  requests: Record<ID, Request>;
  notifications: Record<ID, AppNotification>;
};

export type AppAction =
  | { type: "setCurrentUser"; payload?: User }
  | { type: "createPost"; payload: Post }
  | { type: "createResponse"; payload: Response }
  | { type: "follow"; payload: { fromId: ID; toId: ID } }
  | { type: "unfollow"; payload: { fromId: ID; toId: ID } }
  | { type: "sendRequest"; payload: Request }
  | { type: "updateRequest"; payload: { id: ID; status: "pending" | "accepted" | "declined" } }
  | { type: "updateUser"; payload: User }
  | { type: "addReview"; payload: Review }
  | { type: "addNotification"; payload: AppNotification }
  | { type: "markNotificationRead"; payload: { id: ID } }
  | { type: "markAllNotificationsRead" };

export {};

const BASE_URL = "https://backenddevsyncconnect.dev/api/v1";

export function getToken() {
  return localStorage.getItem("devsync_auth_token");
}

export function setToken(token: string) {
  localStorage.setItem("devsync_auth_token", token);
}

export function removeToken() {
  localStorage.removeItem("devsync_auth_token");
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  // Only set Content-Type to JSON if it's not FormData (which sets its own boundary)
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMsg = "An error occurred";
      try {
        const errorData = await response.json();
        errorMsg = errorData.detail || errorMsg;
        if (Array.isArray(errorMsg)) {
          // FastAPI validation error format
          errorMsg = errorMsg.map((e: any) => e.msg).join(", ");
        }
      } catch (e) {
        // Ignored
      }
      throw new Error(errorMsg);
    }

    // If response is empty (e.g. 204 No Content), return null
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error("Connection timed out. Please check if the backend server is running.");
    }
    throw err;
  }
}

export const api = {
  login: async (data: { identifier: string; password: string }) => {
    return fetchAPI("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  
  signup: async (data: { username: string; email: string; password: string }) => {
    return fetchAPI("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  
  getMe: async () => {
    return fetchAPI("/users/me", {
      method: "GET",
    });
  },

  updateMe: async (data: any) => {
    return fetchAPI("/users/me", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  listUsers: async (params?: { q?: string; skill?: string; skip?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.q) searchParams.set("q", params.q);
    if (params?.skill) searchParams.set("skill", params.skill);
    if (params?.skip) searchParams.set("skip", String(params.skip));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    const qs = searchParams.toString();
    return fetchAPI(`/users/${qs ? `?${qs}` : ""}`, { method: "GET" });
  },

  getUserProfile: async (username: string) => {
    return fetchAPI(`/users/profile/${username}`, { method: "GET" });
  },

  getStats: async () => {
    return fetchAPI("/users/online-count", { method: "GET" });
  },

  followUser: async (userId: number) => {
    return fetchAPI(`/users/${userId}/follow`, { method: "POST" });
  },

  unfollowUser: async (userId: number) => {
    return fetchAPI(`/users/${userId}/follow`, { method: "DELETE" });
  },

  // Dashboard
  getDashboard: async () => {
    return fetchAPI("/dashboard/me", { method: "GET" });
  },

  // Projects
  getMyProjects: async () => {
    return fetchAPI("/projects/me", { method: "GET" });
  },

  createProject: async (data: { name: string; description: string; tech?: string[]; roles?: string[]; domains?: string[]; project_type?: string; visibility?: string; headline?: string; max_members?: number; reference_link?: string }) => {
    return fetchAPI("/projects/", { method: "POST", body: JSON.stringify(data) });
  },

  getProject: async (projectId: number) => {
    return fetchAPI(`/projects/${projectId}`, { method: "GET" });
  },

  updateProject: async (projectId: number, data: any) => {
    return fetchAPI(`/projects/${projectId}`, { method: "PUT", body: JSON.stringify(data) });
  },

  deleteProject: async (projectId: number) => {
    return fetchAPI(`/projects/${projectId}`, { method: "DELETE" });
  },

  // Teams
  getMyTeams: async () => {
    return fetchAPI("/teams/me", { method: "GET" });
  },

  getTeam: async (teamId: number) => {
    return fetchAPI(`/teams/${teamId}`, { method: "GET" });
  },

  createTeam: async (data: { name: string; description?: string; active_project_id?: number }) => {
    return fetchAPI("/teams/", { method: "POST", body: JSON.stringify(data) });
  },

  updateTeam: async (teamId: number, data: any) => {
    return fetchAPI(`/teams/${teamId}`, { method: "PUT", body: JSON.stringify(data) });
  },

  getTeamTasks: async (teamId: number) => {
    return fetchAPI(`/teams/${teamId}/tasks`, { method: "GET" });
  },

  createTask: async (teamId: number, data: { title: string; description?: string; status?: string; assignee_id?: number }) => {
    return fetchAPI(`/teams/${teamId}/tasks`, { method: "POST", body: JSON.stringify(data) });
  },

  updateTask: async (teamId: number, taskId: number, data: any) => {
    return fetchAPI(`/teams/${teamId}/tasks/${taskId}`, { method: "PUT", body: JSON.stringify(data) });
  },

  // Notifications
  getNotifications: async (unreadOnly?: boolean) => {
    const qs = unreadOnly ? "?unread_only=true" : "";
    return fetchAPI(`/notifications/${qs}`, { method: "GET" });
  },

  markNotificationRead: async (notificationId: number) => {
    return fetchAPI(`/notifications/${notificationId}/read`, { method: "PATCH" });
  },

  markAllNotificationsRead: async () => {
    return fetchAPI("/notifications/mark-all-read", { method: "POST" });
  },

  // Requests
  getRequests: async (status: string) => {
    return fetchAPI(`/requests/${status}`, { method: "GET" });
  },

  createRequest: async (data: { to_id: number; message?: string; role?: string; project_id?: number }) => {
    return fetchAPI("/requests/", { method: "POST", body: JSON.stringify(data) });
  },
  cancelRequest: async (to_id: number) => {
    return fetchAPI(`/requests/user/${to_id}`, { method: "DELETE" });
  },
  updateRequest: async (requestId: number, data: { status: string }) => {
    return fetchAPI(`/requests/${requestId}`, { method: "PATCH", body: JSON.stringify(data) });
  },

  // Password
  changePassword: async (data: { current_password: string; new_password: string }) => {
    return fetchAPI("/users/me/change-password", { method: "PUT", body: JSON.stringify(data) });
  },
};

<<<<<<< HEAD

=======
>>>>>>> 642ab8d (feat: implement clickable follower/following lists with remove and redirect logic)



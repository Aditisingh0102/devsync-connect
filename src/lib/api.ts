const BASE_URL = "https://16.170.255.194.nip.io/api/v1";

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

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = "An error occurred";
    try {
      const errorData = await response.json();
      errorMsg = errorData.detail || errorMsg;
      if (Array.isArray(errorMsg)) {
        // FastAPI validation error format
        errorMsg = errorMsg.map(e => e.msg).join(", ");
      }
    } catch (e) {
      // Ignored
    }
    throw new Error(errorMsg);
  }

  // If response is empty (e.g. 204 No Content), return null
  const text = await response.text();
  return text ? JSON.parse(text) : null;
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
};

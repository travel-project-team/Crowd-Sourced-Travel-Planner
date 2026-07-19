// Dedicated HTTP request file for all backend FastAPI communication

// Vite proxy -- Development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const REQUEST_TIMEOUT = 10000;


// Convert params object to a query string and skipping empty values. Example: buildQuery({ location: "Seattle", limit: 10 }) --> "?location=Seattle&limit=10"
function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.append(key, value);
    }
  });
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

// HTTP request engine
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  // Server timeout support
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  // Include HTTP authentication cookies with every request
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      credentials: "include",
      headers: {
        ...(options.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...options.headers,},
    });

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;

      try {
        const errorBody = await response.json();
        errorMessage = errorBody.message || errorBody.detail || errorMessage;
      } catch {
        // Response body wasn't JSON. Default message
      }

      throw new Error(errorMessage);
    }

    // Handle empty responses
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (err) {
    // Timeout triggered by AbortController above
    if (err.name === "AbortError") {
      throw new Error("The request timed out. Please try again.");
    }
    // Network failure
    if (err instanceof TypeError) {
      throw new Error(
        "Unable to connect to the server. Please check your connection or try again later."
      );
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}


// Helper function for data type in request body
function formatBody(body) {
  if (body instanceof FormData) {
    return body; // Image or file
  }

  return JSON.stringify(body); // Normal JSON data
}


// HTTP method wrapper
const api = {
  get: (endpoint) => request(endpoint, { method: "GET" }),

  post: (endpoint, body) => request(endpoint, { method: "POST", body: formatBody(body)}),

  put: (endpoint, body) => request(endpoint, { method: "PUT", body: formatBody(body)}),

  delete: (endpoint) => request(endpoint, { method: "DELETE" }),
};


// Backend-Frontend server health
export const serverHealthApi = {
  check: () => api.get("/server-health"),
};


/* =============
   Users
================ */
export const usersApi = {
  create: (data) => api.post("/users", data),

  login: (data) => api.post("/users/login", data),

  logout: () => api.post("/users/logout"),

  getProfile: () => api.get("/users"),

  update: (data) => api.put("/users", data),

  // New
  updatePassword: (data) => api.put("/users/password", data),

  remove: () => api.delete("/users"),

  // Accepts array of 1 or more ID/email
  getByIds: (data) => api.post("/users/id", data),

  getByEmails: (data) => api.post("/users/email", data),
  
  uploadAvatar: (data) => api.post("/users/avatar", data),
  
  removeAvatar: () => api.delete("/users/avatar"),
};


/* =============
   Trips
================ */
export const tripsApi = {
  getAll: () => api.get("/trips"),

  getById: (id) => api.get(`/trips/${id}`),

  create: (data) => api.post("/trips", data),

  update: (id, data) => api.put(`/trips/${id}`, data),

  remove: (id) => api.delete(`/trips/${id}`),
};


/* =============
   Experiences
================ */
export const experiencesApi = {
  getAll: () => api.get("/experiences"),

  getById: (id) => api.get(`/experiences/${id}`),

  // Search by location and other filters. Example experiencesApi.search({ location: "Portland" })
  search: (params) => api.get(`/experiences${buildQuery(params)}`),

  create: (data) => api.post("/experiences", data),

  update: (id, data) => api.put(`/experiences/${id}`, data),

  remove: (id) => api.delete(`/experiences/${id}`),
};

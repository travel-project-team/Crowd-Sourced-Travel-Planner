// Dedicated HTTP request configuration

const API_BASE_URL = "http://127.0.0.1:8000";

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorBody = await response.json();
        errorMessage = errorBody.message || errorBody.detail || errorMessage;
      } catch {
        // Response body wasn't JSON, fall back to default message
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (err) {
    if (err instanceof TypeError) {
      throw new Error(
        "Unable to connect to the server. Please check your connection or try again later."
      );
    }
    throw err;
  }
}

export const api = {
  get: (endpoint) => request(endpoint, { method: "GET" }),
  post: (endpoint, body) =>
    request(endpoint, { method: "POST", body: JSON.stringify(body) }),
  put: (endpoint, body) =>
    request(endpoint, { method: "PUT", body: JSON.stringify(body) }),
  delete: (endpoint) => request(endpoint, { method: "DELETE" }),
};
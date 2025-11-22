const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://teamchaika-dep-back-71b8.twc1.net/api/v1";

function getAuthHeaders(token) {
  const headers = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function request(method, path, payload = null, token = null) {
  const options = {
    method,
    headers: getAuthHeaders(token),
  };

  if (payload) {
    options.body = JSON.stringify(payload);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMessage = data?.detail ?? "Request failed";
    throw new Error(errorMessage);
  }

  return data;
}

export const http = {
  get: (path, token) => request("GET", path, null, token),
  post: (path, payload, token) => request("POST", path, payload, token),
  put: (path, payload, token) => request("PUT", path, payload, token),
  delete: (path, token) => request("DELETE", path, null, token),
};


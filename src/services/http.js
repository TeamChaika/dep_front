const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://b1.chaika.team/api/v1";

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
    let errorMessage = "Request failed";
    
    if (data?.detail) {
      if (typeof data.detail === 'string') {
        errorMessage = data.detail;
      } else if (Array.isArray(data.detail)) {
        // FastAPI validation error format
        errorMessage = data.detail
          .map(err => `${err.loc?.[1] || 'Field'}: ${err.msg}`)
          .join('\n');
      } else {
        errorMessage = JSON.stringify(data.detail);
      }
    }
    
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

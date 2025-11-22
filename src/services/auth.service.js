import { http } from "./http";

export const authService = {
  register: (payload) => http.post("/auth/register", payload),
  login: (payload) => http.post("/auth/login", payload),
  requestPasswordReset: (payload) => http.post("/auth/request-password-reset", payload),
  resetPassword: (payload) => http.post("/auth/reset-password", payload),
  changePassword: (payload) => http.post("/auth/change-password", payload),
  changeEmail: (payload) => http.post("/auth/change-email", payload),
  logout: (token) => http.post("/auth/logout", {}, token),
};


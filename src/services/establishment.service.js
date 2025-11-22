import { http } from "./http";

export const establishmentService = {
  create: (payload, token) => http.post("/establishments", payload, token),
  getAll: (token, skip = 0, limit = 100) => 
    http.get(`/establishments?skip=${skip}&limit=${limit}`, token),
  getById: (id, token) => http.get(`/establishments/${id}`, token),
  update: (id, payload, token) => http.put(`/establishments/${id}`, payload, token),
  delete: (id, token) => http.delete(`/establishments/${id}`, token),
};


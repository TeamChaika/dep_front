import { http } from "./http";

export const depositService = {
  create: (payload, token) => http.post("/deposits", payload, token),
  getAll: (token, establishmentId = null, eventId = null, skip = 0, limit = 100) => {
    let path = `/deposits?skip=${skip}&limit=${limit}`;
    if (establishmentId) path += `&establishment_id=${establishmentId}`;
    if (eventId) path += `&event_id=${eventId}`;
    return http.get(path, token);
  },
  getById: (id, token) => http.get(`/deposits/${id}`, token),
  getByLink: (paymentLink) => http.get(`/deposits/by-link/${paymentLink}`),
  update: (id, payload, token) => http.put(`/deposits/${id}`, payload, token),
  delete: (id, token) => http.delete(`/deposits/${id}`, token),
};


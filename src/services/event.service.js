import { http } from "./http";

export const eventService = {
  create: (payload, token) => http.post("/events", payload, token),
  getAll: (token, establishmentId = null, skip = 0, limit = 100) => {
    let path = `/events?skip=${skip}&limit=${limit}`;
    if (establishmentId) {
      path += `&establishment_id=${establishmentId}`;
    }
    return http.get(path, token);
  },
  getById: (id, token) => http.get(`/events/${id}`, token),
  getPublic: (id) => http.get(`/events/public/${id}`),
  update: (id, payload, token) => http.put(`/events/${id}`, payload, token),
  delete: (id, token) => http.delete(`/events/${id}`, token),
};


import { http } from "./http";

export const promoCodeService = {
  create: (payload, token) => http.post("/promo-codes", payload, token),
  getAll: (token, eventId = null, skip = 0, limit = 100) => {
    let path = `/promo-codes?skip=${skip}&limit=${limit}`;
    if (eventId) path += `&event_id=${eventId}`;
    return http.get(path, token);
  },
  getById: (id, token) => http.get(`/promo-codes/${id}`, token),
  validate: (payload) => http.post("/promo-codes/validate", payload),
  update: (id, payload, token) => http.put(`/promo-codes/${id}`, payload, token),
  delete: (id, token) => http.delete(`/promo-codes/${id}`, token),
};


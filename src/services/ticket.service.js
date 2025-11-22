import { http } from "./http";

export const ticketService = {
  create: (payload, token) => http.post("/tickets", payload, token),
  getAll: (token, eventId = null, skip = 0, limit = 100) => {
    let path = `/tickets?skip=${skip}&limit=${limit}`;
    if (eventId) path += `&event_id=${eventId}`;
    return http.get(path, token);
  },
  getById: (id, token) => http.get(`/tickets/${id}`, token),
  getByQR: (qrCode) => http.get(`/tickets/by-qr/${qrCode}`),
  checkIn: (qrCode, payload) => http.post(`/tickets/check-in/${qrCode}`, payload),
  update: (id, payload, token) => http.put(`/tickets/${id}`, payload, token),
  delete: (id, token) => http.delete(`/tickets/${id}`, token),
};


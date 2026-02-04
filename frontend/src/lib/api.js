import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
});

export const fetchEvents = (params) => api.get("/api/events", { params });
export const createTicketClick = (payload) => api.post("/api/tickets", payload);
export const fetchAdminEvents = (params) => api.get("/api/admin/events", { params });
export const importEvent = (id, payload) => api.post(`/api/admin/events/${id}/import`, payload);
export const fetchMe = () => api.get("/auth/me");
export const logout = () => api.get("/auth/logout");

export default api;

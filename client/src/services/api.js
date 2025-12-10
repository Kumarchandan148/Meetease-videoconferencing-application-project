import axios from "axios";

const API_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
};

export const roomAPI = {
  create: (roomData) => api.post("/rooms/create", roomData),
  join: (roomId) => api.post(`/rooms/join/${roomId}`),
  getRoom: (roomId) => api.get(`/rooms/${roomId}`),
};

export default api;

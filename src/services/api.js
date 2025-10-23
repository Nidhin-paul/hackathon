import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Emergency Contacts API
export const contactsAPI = {
  getAll: (params) => api.get('/contacts', { params }),
  getById: (id) => api.get(`/contacts/${id}`),
  create: (data) => api.post('/contacts', data),
  update: (id, data) => api.put(`/contacts/${id}`, data),
  delete: (id) => api.delete(`/contacts/${id}`),
};

// Emergency Logs API
export const logsAPI = {
  getAll: () => api.get('/logs'),
  getById: (id) => api.get(`/logs/${id}`),
  create: (data) => api.post('/logs', data),
  updateStatus: (id, status) => api.patch(`/logs/${id}/status`, { status }),
  delete: (id) => api.delete(`/logs/${id}`),
};

// Authentication API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: (token) => api.get('/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
  }),
  getAllUsers: () => api.get('/auth/users'),
};

// User Activity API
export const activitiesAPI = {
  getAll: (params) => api.get('/activities', { params }),
  create: (data) => api.post('/activities', data),
  getStats: () => api.get('/activities/stats'),
  delete: (id) => api.delete(`/activities/${id}`),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;

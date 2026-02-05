/**
 * API Service for Admin Dashboard
 * Handles all HTTP requests to backend
 */

import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken
          });

          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API Service Object
const api = {
  // ==================== AUTH ====================
  auth: {
    login: (credentials) => apiClient.post('/auth/login', credentials),
    register: (userData) => apiClient.post('/auth/register', userData),
    logout: () => apiClient.post('/auth/logout'),
    getProfile: () => apiClient.get('/auth/me'),
    updateProfile: (data) => apiClient.put('/auth/profile', data),
    changePassword: (data) => apiClient.put('/auth/change-password', data),
    refreshToken: (refreshToken) => apiClient.post('/auth/refresh', { refreshToken })
  },

  // ==================== ADMIN ====================
  admin: {
    getDashboard: () => apiClient.get('/admin/dashboard'),
    getUsers: (params) => apiClient.get('/admin/users', { params }),
    getUser: (id) => apiClient.get(`/admin/users/${id}`),
    updateUser: (id, data) => apiClient.put(`/admin/users/${id}`, data),
    getTickets: (params) => apiClient.get('/admin/tickets', { params }),
    assignTicket: (id) => apiClient.post(`/admin/tickets/${id}/assign`),
    resolveTicket: (id) => apiClient.post(`/admin/tickets/${id}/resolve`),
    getActivity: () => apiClient.get('/admin/activity')
  },

  // ==================== USERS ====================
  users: {
    getAll: (params) => apiClient.get('/users', { params }),
    getProfile: () => apiClient.get('/users/profile'),
    updateProfile: (data) => apiClient.put('/users/profile', data),
    getDashboard: () => apiClient.get('/users/dashboard'),
    getStats: () => apiClient.get('/users/stats'),
    getActivity: (params) => apiClient.get('/users/activity', { params }),
    search: (query) => apiClient.get('/users/search', { params: { q: query } }),
    deleteAccount: () => apiClient.delete('/users/account')
  },

  // ==================== DEVICES ====================
  devices: {
    getAll: (params) => apiClient.get('/devices', { params }),
    getById: (id) => apiClient.get(`/devices/${id}`),
    create: (data) => apiClient.post('/devices', data),
    update: (id, data) => apiClient.put(`/devices/${id}`, data),
    delete: (id) => apiClient.delete(`/devices/${id}`),
    getMonitoring: (id, hours) => apiClient.get(`/devices/${id}/monitoring`, { params: { hours } }),
    getAlerts: (id) => apiClient.get(`/devices/${id}/alerts`),
    heartbeat: (id, status) => apiClient.post(`/devices/${id}/heartbeat`, { status }),
    reportMetrics: (id, metrics) => apiClient.post(`/devices/${id}/metrics`, metrics),
    getStats: () => apiClient.get('/devices/stats'),
    search: (query) => apiClient.get('/devices/search', { params: { q: query } })
  },

  // ==================== SUBSCRIPTIONS ====================
  subscriptions: {
    getCurrent: () => apiClient.get('/subscriptions/current'),
    getHistory: () => apiClient.get('/subscriptions/history'),
    getPlans: () => apiClient.get('/subscriptions/plans'),
    create: (data) => apiClient.post('/subscriptions', data),
    upgrade: (plan) => apiClient.put('/subscriptions/upgrade', { new_plan: plan }),
    cancel: (reason) => apiClient.post('/subscriptions/cancel', { reason }),
    renew: (months) => apiClient.post('/subscriptions/renew', { months }),
    checkLimit: (type) => apiClient.get(`/subscriptions/check-limit/${type}`),
    getInvoices: (params) => apiClient.get('/subscriptions/invoices', { params })
  },

  // ==================== TICKETS ====================
  tickets: {
    getAll: (params) => apiClient.get('/tickets', { params }),
    getById: (id) => apiClient.get(`/tickets/${id}`),
    create: (data) => apiClient.post('/tickets', data),
    addMessage: (id, message) => apiClient.post(`/tickets/${id}/messages`, { message }),
    close: (id) => apiClient.post(`/tickets/${id}/close`)
  },

  // ==================== MONITORING ====================
  monitoring: {
    getRealtime: () => apiClient.get('/monitoring/realtime'),
    getDeviceMetrics: (deviceId, hours) => apiClient.get(`/monitoring/devices/${deviceId}`, { params: { hours } }),
    getAlerts: (params) => apiClient.get('/monitoring/alerts', { params }),
    resolveAlert: (id) => apiClient.post(`/monitoring/alerts/${id}/resolve`),
    getStats: () => apiClient.get('/monitoring/stats')
  },

  // ==================== BILLING ====================
  billing: {
    getInvoices: (params) => apiClient.get('/billing/invoices', { params }),
    getInvoice: (id) => apiClient.get(`/billing/invoices/${id}`),
    getHistory: (params) => apiClient.get('/billing/history', { params }),
    createPayment: (data) => apiClient.post('/billing/payment', data),
    getStats: () => apiClient.get('/billing/stats')
  }
};

export default api;
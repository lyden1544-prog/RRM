/**
 * Authentication Store (Pinia)
 * Manages user authentication state
 */

import { defineStore } from 'pinia';
import api from '../services/api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    isAuthenticated: !!localStorage.getItem('accessToken'),
    loading: false,
    error: null
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated && state.user !== null,
    currentUser: (state) => state.user,
    isAdmin: (state) => state.user?.role === 'admin'
  },

  actions: {
    async login(credentials) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.auth.login(credentials);
        const { user, accessToken, refreshToken } = response.data.data;

        this.user = user;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.isAuthenticated = true;

        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        this.loading = false;
        return response.data;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'Login failed';
        throw error;
      }
    },

    async register(userData) {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.auth.register(userData);
        const { user, accessToken, refreshToken } = response.data.data;

        this.user = user;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.isAuthenticated = true;

        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        this.loading = false;
        return response.data;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'Registration failed';
        throw error;
      }
    },

    async logout() {
      try {
        await api.auth.logout();
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        this.user = null;
        this.accessToken = null;
        this.refreshToken = null;
        this.isAuthenticated = false;

        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    },

    async fetchProfile() {
      this.loading = true;
      this.error = null;

      try {
        const response = await api.auth.getProfile();
        this.user = response.data.data.user;
        localStorage.setItem('user', JSON.stringify(this.user));
        this.loading = false;
        return response.data;
      } catch (error) {
        this.loading = false;
        this.error = error.response?.data?.message || 'Failed to fetch profile';
        throw error;
      }
    },

    checkAuth() {
      const token = localStorage.getItem('accessToken');
      const user = localStorage.getItem('user');

      if (token && user) {
        this.isAuthenticated = true;
        this.accessToken = token;
        this.user = JSON.parse(user);
        return true;
      }

      return false;
    }
  }
});
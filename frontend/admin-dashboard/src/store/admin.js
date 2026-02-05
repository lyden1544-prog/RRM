/**
 * Admin Store (Pinia)
 */

import { defineStore } from 'pinia';
import api from '../services/api';

export const useAdminStore = defineStore('admin', {
  state: () => ({
    dashboardData: null,
    users: [],
    tickets: [],
    recentActivity: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchDashboard() {
      this.loading = true;
      try {
        const response = await api.admin.getDashboard();
        this.dashboardData = response.data.data;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch dashboard';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchUsers(params = {}) {
      this.loading = true;
      try {
        const response = await api.admin.getUsers(params);
        this.users = response.data.data.users;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch users';
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});
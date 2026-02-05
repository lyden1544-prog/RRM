/**
 * Devices Store (Pinia)
 */

import { defineStore } from 'pinia';
import api from '../services/api';

export const useDevicesStore = defineStore('devices', {
  state: () => ({
    devices: [],
    currentDevice: null,
    stats: null,
    loading: false,
    error: null
  }),

  actions: {
    async fetchDevices(params = {}) {
      this.loading = true;
      try {
        const response = await api.devices.getAll(params);
        this.devices = response.data.data.devices;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch devices';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchStats() {
      this.loading = true;
      try {
        const response = await api.devices.getStats();
        this.stats = response.data.data.stats;
        return response.data;
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch stats';
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});
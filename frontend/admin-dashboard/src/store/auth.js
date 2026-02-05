// frontend/admin-dashboard/src/store/auth.js - FIXED
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(localStorage.getItem('token') || null);
  const isAuthenticated = computed(() => !!token.value);

  const setUser = (userData) => {
    user.value = userData;
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const setToken = (newToken) => {
    token.value = newToken;
    localStorage.setItem('token', newToken);
  };

  const login = async (email, password) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      setToken(result.data.session.access_token);
      setUser(result.data.user);

      return { success: true, user: result.data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (email, password, full_name, company_name) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          full_name,
          company_name,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.value}`,
        },
      });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear local state regardless of API call
      user.value = null;
      token.value = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const getUser = async () => {
    if (!token.value) return null;

    try {
      const response = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token.value}` },
      });

      const result = await response.json();

      if (result.success) {
        setUser(result.data.user);
        return result.data.user;
      }

      logout();
      return null;
    } catch (error) {
      console.error('Error fetching user:', error);
      logout();
      return null;
    }
  };

  const updateProfile = async (updates) => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.value}`,
        },
        body: JSON.stringify(updates),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      setUser(result.data.user);
      return { success: true, user: result.data.user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const deleteAccount = async () => {
    try {
      const response = await fetch('/api/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.value}`,
        },
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      logout();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Initialize from localStorage
  const initialize = async () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      user.value = JSON.parse(storedUser);
    }

    if (token.value) {
      await getUser();
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    setUser,
    setToken,
    login,
    register,
    logout,
    getUser,
    updateProfile,
    deleteAccount,
    initialize,
  };
});
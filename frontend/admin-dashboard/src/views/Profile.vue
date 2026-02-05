<!-- frontend/admin-dashboard/src/views/Profile.vue -->
<template>
  <div class="profile-page">
    <div class="profile-header">
      <h1>Profile Settings</h1>
      <router-link to="/" class="btn-secondary">← Back to Dashboard</router-link>
    </div>

    <div class="profile-content">
      <div class="profile-card">
        <h2>Account Information</h2>

        <form @submit.prevent="updateProfile">
          <div class="form-group">
            <label>Full Name</label>
            <input 
              v-model="form.full_name" 
              type="text" 
              required
            />
          </div>

          <div class="form-group">
            <label>Email</label>
            <input 
              v-model="form.email" 
              type="email" 
              disabled
            />
            <small>Email cannot be changed</small>
          </div>

          <div class="form-group">
            <label>Company</label>
            <input 
              v-model="form.company_name" 
              type="text"
            />
          </div>

          <div class="form-group">
            <label>Phone</label>
            <input 
              v-model="form.phone" 
              type="tel"
            />
          </div>

          <div v-if="success" class="success-message">
            ✓ Profile updated successfully!
          </div>

          <div v-if="error" class="error-message">
            ✗ {{ error }}
          </div>

          <button type="submit" :disabled="loading" class="btn-primary">
            {{ loading ? 'Saving...' : 'Save Changes' }}
          </button>
        </form>
      </div>

      <div class="profile-card">
        <h2>Danger Zone</h2>
        <p style="color: #7f8c8d;">Irreversible actions</p>

        <button @click="logout" class="btn-danger-block">
          Logout
        </button>

        <button @click="showDeleteModal = true" class="btn-danger-block" style="margin-top: 1rem;">
          Delete Account
        </button>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
      <div class="modal" @click.stop>
        <h3>Delete Account?</h3>
        <p>This action cannot be undone. All your data will be permanently deleted.</p>
        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="btn-secondary">Cancel</button>
          <button @click="deleteAccount" class="btn-danger">Delete Account</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth.js';

export default {
  name: 'Profile',
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const loading = ref(false);
    const success = ref(false);
    const error = ref('');
    const showDeleteModal = ref(false);

    const form = ref({
      full_name: '',
      email: '',
      company_name: '',
      phone: '',
    });

    const updateProfile = async () => {
      loading.value = true;
      error.value = '';
      success.value = false;

      try {
        const result = await authStore.updateProfile({
          full_name: form.value.full_name,
          company_name: form.value.company_name,
          phone: form.value.phone,
        });

        if (result.success) {
          success.value = true;
          setTimeout(() => {
            success.value = false;
          }, 3000);
        } else {
          error.value = result.error || 'Failed to update profile';
        }
      } catch (err) {
        error.value = err.message || 'An error occurred';
      } finally {
        loading.value = false;
      }
    };

    const logout = () => {
      authStore.logout();
      router.push('/login');
    };

    const deleteAccount = async () => {
      try {
        const response = await fetch('/api/auth/delete-account', {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        });

        const result = await response.json();

        if (result.success) {
          authStore.logout();
          router.push('/login');
        }
      } catch (err) {
        error.value = err.message || 'Failed to delete account';
      }
    };

    onMounted(() => {
      if (!authStore.isAuthenticated) {
        router.push('/login');
        return;
      }

      // Populate form with user data
      if (authStore.user) {
        form.value.full_name = authStore.user.full_name || '';
        form.value.email = authStore.user.email || '';
        form.value.company_name = authStore.user.company_name || '';
        form.value.phone = authStore.user.phone || '';
      }
    });

    return {
      authStore,
      form,
      loading,
      success,
      error,
      showDeleteModal,
      updateProfile,
      logout,
      deleteAccount,
    };
  },
};
</script>

<style scoped>
.profile-page {
  max-width: 800px;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #ecf0f1;
}

.profile-header h1 {
  margin: 0;
  color: #2c3e50;
}

.profile-content {
  display: grid;
  gap: 2rem;
}

.profile-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-card h2 {
  margin: 0 0 1.5rem;
  color: #2c3e50;
  border-bottom: 2px solid #ecf0f1;
  padding-bottom: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input:disabled {
  background: #f8f9fa;
  color: #7f8c8d;
  cursor: not-allowed;
}

.form-group small {
  margin-top: 0.25rem;
  color: #7f8c8d;
  font-size: 0.85rem;
}

.success-message,
.error-message {
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.success-message {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.btn-primary,
.btn-secondary,
.btn-danger-block {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary {
  background: #667eea;
  color: white;
  width: 100%;
}

.btn-primary:hover:not(:disabled) {
  background: #5568d3;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #ecf0f1;
  color: #2c3e50;
  text-decoration: none;
  display: inline-block;
}

.btn-secondary:hover {
  background: #bdc3c7;
}

.btn-danger-block {
  background: #e74c3c;
  color: white;
  width: 100%;
}

.btn-danger-block:hover {
  background: #c0392b;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal h3 {
  margin: 0 0 1rem;
  color: #2c3e50;
}

.modal p {
  margin: 0 0 1.5rem;
  color: #7f8c8d;
  line-height: 1.6;
}

.modal-actions {
  display: flex;
  gap: 1rem;
}

.modal-actions button {
  flex: 1;
}

@media (max-width: 600px) {
  .profile-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .profile-card {
    padding: 1.5rem;
  }
}
</style>

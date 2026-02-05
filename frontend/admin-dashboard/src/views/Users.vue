<!-- frontend/admin-dashboard/src/views/Users.vue -->
<template>
  <div class="users">
    <!-- Header -->
    <div class="header">
      <h1>Users Management</h1>
      <button @click="showCreateModal = true" class="btn-primary">+ Add User</button>
    </div>

    <!-- Search and Filters -->
    <div class="filters-section">
      <div class="search-box">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search by name or email..."
        />
      </div>
      <div class="filter-group">
        <select v-model="filterStatus" class="filter-select">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="deleted">Deleted</option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <p>Loading users...</p>
    </div>

    <!-- Users Table -->
    <div v-else-if="paginatedUsers.length > 0" class="table-wrapper">
      <table class="users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Company</th>
            <th>Phone</th>
            <th>Status</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in paginatedUsers" :key="user.id" class="user-row">
            <td>{{ user.full_name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.company_name || '-' }}</td>
            <td>{{ user.phone || '-' }}</td>
            <td>
              <span :class="['status-badge', `status-${user.status}`]">
                {{ user.status }}
              </span>
            </td>
            <td>{{ formatDate(user.created_at) }}</td>
            <td class="actions">
              <button @click="editUser(user)" class="btn-small btn-edit">Edit</button>
              <button @click="deleteUserConfirm(user)" class="btn-small btn-delete">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="pagination" v-if="totalPages > 1">
        <button 
          @click="currentPage--" 
          :disabled="currentPage === 1"
          class="btn-secondary"
        >
          ← Previous
        </button>
        <span class="page-info">
          Page {{ currentPage }} of {{ totalPages }}
        </span>
        <button 
          @click="currentPage++" 
          :disabled="currentPage === totalPages"
          class="btn-secondary"
        >
          Next →
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <p>No users found</p>
      <button @click="showCreateModal = true" class="btn-primary">Create First User</button>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ editingUser ? 'Edit User' : 'Create New User' }}</h2>
          <button @click="closeModal" class="btn-close">×</button>
        </div>

        <form @submit.prevent="saveUser" class="modal-form">
          <div class="form-group">
            <label>Full Name *</label>
            <input 
              v-model="form.full_name" 
              type="text"
              required
            />
          </div>

          <div class="form-group">
            <label>Email *</label>
            <input 
              v-model="form.email" 
              type="email"
              :disabled="!!editingUser"
              required
            />
            <small v-if="editingUser">Email cannot be changed</small>
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

          <div v-if="!editingUser" class="form-group">
            <label>Password *</label>
            <input 
              v-model="form.password" 
              type="password"
              placeholder="Minimum 6 characters"
              required
            />
          </div>

          <div v-if="editingUser" class="form-group">
            <label>Status</label>
            <select v-model="form.status">
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="deleted">Deleted</option>
            </select>
          </div>

          <div v-if="formError" class="error-message">{{ formError }}</div>
          <div v-if="formSuccess" class="success-message">{{ formSuccess }}</div>

          <div class="form-actions">
            <button type="submit" :disabled="formLoading" class="btn-primary">
              {{ formLoading ? 'Saving...' : editingUser ? 'Update User' : 'Create User' }}
            </button>
            <button type="button" @click="closeModal" class="btn-secondary">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>Delete User?</h2>
          <button @click="showDeleteModal = false" class="btn-close">×</button>
        </div>

        <div class="modal-content">
          <p>Are you sure you want to delete <strong>{{ deleteUser?.full_name }}</strong>?</p>
          <p class="warning">This action cannot be undone.</p>

          <div class="modal-actions">
            <button @click="confirmDelete" :disabled="deleteLoading" class="btn-danger">
              {{ deleteLoading ? 'Deleting...' : 'Delete' }}
            </button>
            <button @click="showDeleteModal = false" class="btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useAuthStore } from '../store/auth.js';

export default {
  name: 'Users',
  setup() {
    const authStore = useAuthStore();

    return {
      authStore,
    };
  },
  data() {
    return {
      users: [],
      loading: false,
      searchQuery: '',
      filterStatus: 'all',
      currentPage: 1,
      itemsPerPage: 10,
      showCreateModal: false,
      showDeleteModal: false,
      editingUser: null,
      deleteUser: null,
      formLoading: false,
      deleteLoading: false,
      formError: '',
      formSuccess: '',
      form: {
        full_name: '',
        email: '',
        company_name: '',
        phone: '',
        password: '',
        status: 'active',
      },
    };
  },
  computed: {
    filteredUsers() {
      return this.users.filter(user => {
        const matchesSearch = 
          user.full_name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          user.email.toLowerCase().includes(this.searchQuery.toLowerCase());
        
        const matchesStatus = this.filterStatus === 'all' || user.status === this.filterStatus;
        
        return matchesSearch && matchesStatus;
      });
    },
    totalPages() {
      return Math.ceil(this.filteredUsers.length / this.itemsPerPage);
    },
    paginatedUsers() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredUsers.slice(start, end);
    },
  },
  methods: {
    async fetchUsers() {
      this.loading = true;
      try {
        const params = new URLSearchParams({
          search: this.searchQuery,
          status: this.filterStatus === 'all' ? '' : this.filterStatus,
          limit: 100,
          offset: 0,
        });

        const response = await fetch(`/api/users?${params}`, {
          headers: { Authorization: `Bearer ${this.authStore.token}` },
        });

        const result = await response.json();

        if (result.success) {
          this.users = result.data.users;
        } else {
          console.error('Error:', result.message);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        this.loading = false;
      }
    },
    editUser(user) {
      this.editingUser = user;
      this.form = {
        full_name: user.full_name,
        email: user.email,
        company_name: user.company_name || '',
        phone: user.phone || '',
        password: '',
        status: user.status,
      };
      this.formError = '';
      this.formSuccess = '';
      this.showCreateModal = true;
    },
    async saveUser() {
      this.formError = '';
      this.formSuccess = '';
      this.formLoading = true;

      try {
        const url = this.editingUser ? `/api/users/${this.editingUser.id}` : '/api/users';
        const method = this.editingUser ? 'PUT' : 'POST';

        const payload = { ...this.form };
        if (this.editingUser && !payload.password) {
          delete payload.password;
        }

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.authStore.token}`,
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!result.success) {
          this.formError = result.message || 'Failed to save user';
          return;
        }

        this.formSuccess = this.editingUser ? 'User updated!' : 'User created!';
        setTimeout(() => {
          this.closeModal();
          this.fetchUsers();
        }, 1000);
      } catch (error) {
        this.formError = error.message;
      } finally {
        this.formLoading = false;
      }
    },
    deleteUserConfirm(user) {
      this.deleteUser = user;
      this.showDeleteModal = true;
    },
    async confirmDelete() {
      this.deleteLoading = true;

      try {
        const response = await fetch(`/api/users/${this.deleteUser.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${this.authStore.token}` },
        });

        const result = await response.json();

        if (result.success) {
          this.showDeleteModal = false;
          this.fetchUsers();
        } else {
          console.error('Error:', result.message);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      } finally {
        this.deleteLoading = false;
      }
    },
    closeModal() {
      this.showCreateModal = false;
      this.editingUser = null;
      this.form = {
        full_name: '',
        email: '',
        company_name: '',
        phone: '',
        password: '',
        status: 'active',
      };
      this.formError = '';
      this.formSuccess = '';
    },
    formatDate(dateString) {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleDateString();
    },
  },
  mounted() {
    this.fetchUsers();
  },
  watch: {
    searchQuery() {
      this.currentPage = 1;
      this.fetchUsers();
    },
    filterStatus() {
      this.currentPage = 1;
      this.fetchUsers();
    },
  },
};
</script>

<style scoped>
.users {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #ecf0f1;
}

.header h1 {
  margin: 0;
  color: #2c3e50;
}

.filters-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  margin-bottom: 2rem;
}

.search-box input,
.filter-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  font-size: 0.95rem;
}

.search-box input:focus,
.filter-select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #7f8c8d;
}

.table-wrapper {
  overflow-x: auto;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  background: #f5f5f5;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e0e0e0;
}

.users-table td {
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
}

.user-row:hover {
  background: #f8f9fa;
}

.status-badge {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.status-active {
  background: #d4edda;
  color: #155724;
}

.status-suspended {
  background: #fff3cd;
  color: #856404;
}

.status-deleted {
  background: #f8d7da;
  color: #721c24;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-small {
  padding: 0.4rem 0.8rem;
  border: none;
  border-radius: 4px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-edit {
  background: #3498db;
  color: white;
}

.btn-edit:hover {
  background: #2980b9;
}

.btn-delete {
  background: #e74c3c;
  color: white;
}

.btn-delete:hover {
  background: #c0392b;
}

.btn-primary {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
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
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;
}

.btn-secondary:hover:not(:disabled) {
  background: #bdc3c7;
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #ecf0f1;
}

.page-info {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: #7f8c8d;
}

.empty-state p {
  margin-bottom: 1rem;
  font-size: 1.1rem;
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
  padding: 1rem;
}

.modal {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #ecf0f1;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
}

.modal-content {
  padding: 1.5rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  color: #7f8c8d;
  transition: color 0.3s;
}

.btn-close:hover {
  color: #2c3e50;
}

.modal-form {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
}

.form-group input,
.form-group select {
  padding: 0.75rem;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  font-size: 0.95rem;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group small {
  margin-top: 0.25rem;
  color: #7f8c8d;
  font-size: 0.85rem;
}

.error-message,
.success-message {
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 0.9rem;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.success-message {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.form-actions button {
  flex: 1;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.modal-actions button {
  flex: 1;
}

.btn-danger {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-danger:hover {
  background: #c0392b;
}

.warning {
  color: #e74c3c;
  font-weight: 500;
}

.no-data {
  text-align: center;
  color: #999;
  padding: 2rem !important;
}

@media (max-width: 768px) {
  .filters-section {
    grid-template-columns: 1fr;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .users-table th,
  .users-table td {
    padding: 0.75rem 0.5rem;
    font-size: 0.9rem;
  }

  .actions {
    flex-direction: column;
  }
}
</style>

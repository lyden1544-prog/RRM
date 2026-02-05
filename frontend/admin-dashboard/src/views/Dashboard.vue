<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Admin Dashboard</h1>
      <div class="user-info">
        <span>Welcome, {{ user?.full_name || 'Admin' }}</span>
        <button @click="handleLogout" class="btn-logout">Logout</button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>Loading dashboard data...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="fetchDashboard" class="btn-retry">Retry</button>
    </div>

    <!-- Dashboard Content -->
    <div v-else>
      <div class="stats-grid">
        <div class="stat-card users">
          <div class="stat-icon">👥</div>
          <h3>Total Users</h3>
          <p class="stat-number">{{ stats.users }}</p>
          <p class="stat-change">{{ stats.usersChange || '+12%' }} from last month</p>
        </div>

        <div class="stat-card devices">
          <div class="stat-icon">💻</div>
          <h3>Active Devices</h3>
          <p class="stat-number">{{ stats.devices }}</p>
          <p class="stat-change">{{ stats.devicesOnline || '0' }} online now</p>
        </div>

        <div class="stat-card revenue">
          <div class="stat-icon">💰</div>
          <h3>Monthly Revenue</h3>
          <p class="stat-number">${{ formatNumber(stats.revenue) }}</p>
          <p class="stat-change">{{ stats.revenueChange || '+8%' }} from last month</p>
        </div>

        <div class="stat-card tickets">
          <div class="stat-icon">🎫</div>
          <h3>Open Tickets</h3>
          <p class="stat-number">{{ stats.tickets }}</p>
          <p class="stat-change">{{ stats.criticalTickets || '0' }} critical</p>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="recent-section">
        <h2>Recent Activity</h2>
        <div class="activity-grid">
          <!-- Recent Transactions -->
          <div class="activity-card">
            <h3>Recent Transactions</h3>
            <div v-if="recentTransactions.length > 0" class="activity-list">
              <div 
                v-for="transaction in recentTransactions" 
                :key="transaction.id"
                class="activity-item"
              >
                <div class="activity-details">
                  <p class="activity-title">{{ transaction.description || 'Payment' }}</p>
                  <p class="activity-meta">{{ formatDate(transaction.created_at) }}</p>
                </div>
                <div class="activity-amount">${{ transaction.amount }}</div>
              </div>
            </div>
            <p v-else class="no-data">No recent transactions</p>
          </div>

          <!-- Open Tickets -->
          <div class="activity-card">
            <h3>Open Tickets</h3>
            <div v-if="openTickets.length > 0" class="activity-list">
              <div 
                v-for="ticket in openTickets" 
                :key="ticket.id"
                class="activity-item"
              >
                <div class="activity-details">
                  <p class="activity-title">{{ ticket.title }}</p>
                  <p class="activity-meta">
                    <span :class="['priority', ticket.priority]">{{ ticket.priority }}</span>
                    {{ formatDate(ticket.created_at) }}
                  </p>
                </div>
              </div>
            </div>
            <p v-else class="no-data">No open tickets</p>
          </div>

          <!-- Critical Alerts -->
          <div class="activity-card">
            <h3>Critical Alerts</h3>
            <div v-if="criticalAlerts.length > 0" class="activity-list">
              <div 
                v-for="alert in criticalAlerts" 
                :key="alert.id"
                class="activity-item"
              >
                <div class="activity-details">
                  <p class="activity-title">{{ alert.message }}</p>
                  <p class="activity-meta">{{ formatDate(alert.created_at) }}</p>
                </div>
              </div>
            </div>
            <p v-else class="no-data">No critical alerts</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore, useAdminStore } from '../store';

export default {
  name: 'Dashboard',
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const adminStore = useAdminStore();

    const loading = ref(true);
    const error = ref('');
    const dashboardData = ref(null);

    const user = computed(() => authStore.user);

    const stats = computed(() => {
      if (!dashboardData.value) {
        return {
          users: 0,
          devices: 0,
          devicesOnline: 0,
          revenue: 0,
          tickets: 0,
          criticalTickets: 0
        };
      }

      const data = dashboardData.value;
      return {
        users: data.users?.total || 0,
        devices: data.devices?.total || 0,
        devicesOnline: data.devices?.online || 0,
        revenue: data.billing?.monthlyRevenue || 0,
        tickets: data.tickets?.open || 0,
        criticalTickets: data.alerts?.criticalUnresolved || 0
      };
    });

    const recentTransactions = computed(() => {
      return dashboardData.value?.recentTransactions?.slice(0, 5) || [];
    });

    const openTickets = computed(() => {
      return dashboardData.value?.openTickets?.slice(0, 5) || [];
    });

    const criticalAlerts = computed(() => {
      return dashboardData.value?.criticalAlerts?.slice(0, 5) || [];
    });

    const fetchDashboard = async () => {
      loading.value = true;
      error.value = '';

      try {
        const response = await adminStore.fetchDashboard();
        dashboardData.value = response.data;
      } catch (err) {
        error.value = err.response?.data?.message || 'Failed to load dashboard data';
        console.error('Dashboard error:', err);
      } finally {
        loading.value = false;
      }
    };

    const handleLogout = async () => {
      await authStore.logout();
      router.push('/login');
    };

    const formatNumber = (num) => {
      return new Intl.NumberFormat('en-US').format(num);
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    onMounted(() => {
      fetchDashboard();
    });

    return {
      loading,
      error,
      user,
      stats,
      recentTransactions,
      openTickets,
      criticalAlerts,
      fetchDashboard,
      handleLogout,
      formatNumber,
      formatDate
    };
  }
};
</script>

<style scoped>
.dashboard {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.dashboard-header h1 {
  margin: 0;
  color: #2c3e50;
  font-size: 2rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info span {
  color: #7f8c8d;
}

.btn-logout {
  padding: 0.5rem 1rem;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-logout:hover {
  background: #c0392b;
}

/* Loading State */
.loading {
  text-align: center;
  padding: 4rem;
  color: #7f8c8d;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #ecf0f1;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error State */
.error-state {
  text-align: center;
  padding: 4rem;
  color: #e74c3c;
}

.btn-retry {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card.users::before { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.stat-card.devices::before { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
.stat-card.revenue::before { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.stat-card.tickets::before { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.stat-card h3 {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: #7f8c8d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.stat-number {
  margin: 0.5rem 0;
  font-size: 2.5rem;
  font-weight: bold;
  color: #2c3e50;
}

.stat-change {
  margin: 0;
  font-size: 0.85rem;
  color: #27ae60;
}

/* Recent Activity */
.recent-section {
  margin-top: 3rem;
}

.recent-section h2 {
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.activity-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.activity-card h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-left: 3px solid #667eea;
  background: #f8f9fa;
  border-radius: 4px;
}

.activity-details {
  flex: 1;
}

.activity-title {
  margin: 0 0 0.25rem 0;
  color: #2c3e50;
  font-weight: 500;
}

.activity-meta {
  margin: 0;
  font-size: 0.85rem;
  color: #7f8c8d;
}

.priority {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 3px;
  font-size: 0.75rem;
  font-weight: bold;
  text-transform: uppercase;
  margin-right: 0.5rem;
}

.priority.low { background: #d5f4e6; color: #27ae60; }
.priority.medium { background: #fff3cd; color: #f39c12; }
.priority.high { background: #f8d7da; color: #e74c3c; }
.priority.critical { background: #721c24; color: white; }

.activity-amount {
  font-size: 1.1rem;
  font-weight: bold;
  color: #27ae60;
}

.no-data {
  color: #95a5a6;
  text-align: center;
  padding: 2rem;
  font-style: italic;
}

@media (max-width: 768px) {
  .dashboard {
    padding: 1rem;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .activity-grid {
    grid-template-columns: 1fr;
  }
}
</style>
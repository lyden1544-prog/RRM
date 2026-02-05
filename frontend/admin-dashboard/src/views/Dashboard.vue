<template>
  <div class="dashboard">
    <h1>Admin Dashboard</h1>
    <div class="stats-grid">
      <div class="stat-card">
        <h3>Total Users</h3>
        <p class="stat-number">{{ stats.users }}</p>
      </div>
      <div class="stat-card">
        <h3>Active Devices</h3>
        <p class="stat-number">{{ stats.devices }}</p>
      </div>
      <div class="stat-card">
        <h3>Revenue</h3>
        <p class="stat-number">${{ stats.revenue }}</p>
      </div>
      <div class="stat-card">
        <h3>Support Tickets</h3>
        <p class="stat-number">{{ stats.tickets }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  data() {
    return {
      stats: {
        users: 0,
        devices: 0,
        revenue: 0,
        tickets: 0
      }
    }
  },
  mounted() {
    // TODO: Fetch stats from API
    // this.fetchStats()
  },
  methods: {
    fetchStats() {
      // API call will go here
    }
  }
}
</script>

<style scoped>
.dashboard {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.dashboard h1 {
  margin: 0 0 2rem 0;
  color: #2c3e50;
  font-size: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-card h3 {
  margin: 0 0 1rem 0;
  font-size: 0.95rem;
  opacity: 0.9;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-number {
  margin: 0;
  font-size: 2.5rem;
  font-weight: bold;
}
</style>
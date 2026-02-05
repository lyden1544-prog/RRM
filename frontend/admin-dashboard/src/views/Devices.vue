
<template>
  <div class="devices">
    <h1>Devices Monitoring</h1>
    <div class="content">
      <div class="devices-grid">
        <div class="device-card">
          <h3>No Devices</h3>
          <p>Waiting for agents to connect...</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Devices',
  data() {
    return {
      devices: []
    }
  },
  mounted() {
    // TODO: Fetch devices from API
  }
}
</script>

<style scoped>
.devices {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.devices h1 {
  margin: 0 0 2rem 0;
  color: #2c3e50;
}

.devices-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.device-card {
  background: #f9f9f9;
  border: 2px dashed #ddd;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  color: #999;
}

.device-card h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.device-card p {
  margin: 0;
  font-size: 0.9rem;
}
</style>
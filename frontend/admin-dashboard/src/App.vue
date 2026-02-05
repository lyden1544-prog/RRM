<template>
  <div class="app">
    <nav class="navbar">
      <div class="nav-container">
        <h1>MockConnect Admin</h1>
        <ul class="nav-links">
          <li><router-link to="/">Dashboard</router-link></li>
          <li><router-link to="/users">Users</router-link></li>
          <li><router-link to="/devices">Devices</router-link></li>
          <li><a @click="handleLogout" href="#" class="logout-link">Logout</a></li>
        </ul>
      </div>
    </nav>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script>
import { useRouter } from 'vue-router'
import { useAuthStore } from './store/auth.js'

export default {
  name: 'App',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    const handleLogout = async (e) => {
      e.preventDefault()
      
      // Call logout in store (calls backend)
      await authStore.logout()
      
      // Redirect to login
      router.push('/login')
    }

    return {
      handleLogout
    }
  }
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
}
</style>

<style scoped>
.app {
  min-height: 100vh;
  background: #f5f5f5;
}

.navbar {
  background: #2c3e50;
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-container h1 {
  margin: 0;
  font-size: 1.5rem;
}

.nav-links {
  list-style: none;
  display: flex;
  gap: 2rem;
  margin: 0;
  padding: 0;
}

.nav-links a {
  color: white;
  text-decoration: none;
  transition: color 0.3s;
  cursor: pointer;
}

.nav-links a:hover {
  color: #42b983;
}

.nav-links a.router-link-active {
  color: #42b983;
  border-bottom: 2px solid #42b983;
}

.logout-link {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  transition: all 0.3s;
}

.logout-link:hover {
  background: rgba(255, 255, 255, 0.2);
  color: #e74c3c;
}

.main-content {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
}
</style>

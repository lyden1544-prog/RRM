import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../store/auth.js'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Users from '../views/Users.vue'
import Devices from '../views/Devices.vue'
import Profile from '../views/Profile.vue'

const routes = [
  { 
    path: '/login', 
    component: Login,
    name: 'Login',
    meta: { requiresAuth: false }
  },
  { 
    path: '/', 
    component: Dashboard,
    name: 'Dashboard',
    meta: { requiresAuth: true }
  },
  { 
    path: '/users', 
    component: Users,
    name: 'Users',
    meta: { requiresAuth: true }
  },
  { 
    path: '/devices', 
    component: Devices,
    name: 'Devices',
    meta: { requiresAuth: true }
  },
  { 
    path: '/profile', 
    component: Profile,
    name: 'Profile',
    meta: { requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard - Check authentication
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth

  // Initialize auth from localStorage if not already done
  if (!authStore.user && authStore.token) {
    await authStore.getUser()
  }

  // If route requires auth and user is NOT authenticated
  if (requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login
    next({ name: 'Login' })
  } 
  // If trying to access login page and user IS authenticated
  else if (to.name === 'Login' && authStore.isAuthenticated) {
    // Redirect to dashboard
    next({ name: 'Dashboard' })
  } 
  // Otherwise, allow navigation
  else {
    next()
  }
})

export default router

import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Users from '../views/Users.vue'
import Devices from '../views/Devices.vue'

const routes = [
  { 
    path: '/', 
    component: Dashboard,
    name: 'Dashboard'
  },
  { 
    path: '/users', 
    component: Users,
    name: 'Users'
  },
  { 
    path: '/devices', 
    component: Devices,
    name: 'Devices'
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

export default router
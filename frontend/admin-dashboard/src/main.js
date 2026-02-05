import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import { createPinia } from 'pinia'

const app = createApp(App)
app.use(createPinia())  // ✓ Already there
app.use(router)         // ✓ Already there
app.mount('#app')
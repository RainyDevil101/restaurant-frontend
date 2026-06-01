import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from '@/modules/auth/store'
import { mockUsers } from '@/shared/mocks'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Dev seed — comment out to test the login flow
if (import.meta.env.DEV) {
  const adminUser = mockUsers[2]  // Roberto (admin) — can access all views
  if (adminUser) useAuthStore().login(adminUser)
}

app.mount('#app')

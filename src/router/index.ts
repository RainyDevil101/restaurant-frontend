import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store'
import type { Role } from '@/modules/auth/store'
import { authRoutes } from '@/modules/auth/route'
import { serviceRoutes } from '@/modules/service/route'
import { checkoutRoutes } from '@/modules/checkout/route'
import { adminRoutes } from '@/modules/admin/route'

declare module 'vue-router' {
  interface RouteMeta {
    roles?: Role[]
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...authRoutes,
    ...serviceRoutes,
    ...checkoutRoutes,
    ...adminRoutes,
    { path: '/:pathMatch(.*)*', redirect: '/login' },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  const roles = to.meta.roles

  // 1. No session + protected route → /login
  if (!auth.isLoggedIn && roles) return '/login'

  // 2. Has session + tries /login → role home
  if (auth.isLoggedIn && to.path === '/login') return auth.roleHome

  // 3. Role not in allowed list → role home
  if (roles && !roles.includes(auth.user!.role)) return auth.roleHome

  // 4. Allow
  return true
})

export default router

import type { RouteRecordRaw } from 'vue-router'
import { Route } from '@/shared/types'

export const authRoutes: RouteRecordRaw[] = [
  {
    path: Route.LOGIN,
    component: () => import('../view/LoginView.vue'),
  },
]

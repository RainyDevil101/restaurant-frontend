import type { RouteRecordRaw } from 'vue-router'
import { ROLE_GROUPS } from '@/modules/auth/constants'

export const serviceRoutes: RouteRecordRaw[] = [
  {
    path: '/service',
    component: () => import('../layout/ServiceLayout.vue'),
    meta: { roles: ROLE_GROUPS.SERVICE },
    children: [
      {
        path: '',
        component: () => import('../view/TableSelectionView.vue'),
        meta: { roles: ROLE_GROUPS.SERVICE },
      },
      {
        path: 'table/:id',
        component: () => import('../view/OrderView.vue'),
        meta: { roles: ROLE_GROUPS.SERVICE },
      },
    ],
  },
]

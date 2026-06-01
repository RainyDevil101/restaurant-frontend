import type { RouteRecordRaw } from 'vue-router'
import { ROLE_GROUPS } from '@/modules/auth/constants'

export const checkoutRoutes: RouteRecordRaw[] = [
  {
    path: '/checkout',
    component: () => import('../layout/CheckoutLayout.vue'),
    meta: { roles: ROLE_GROUPS.CHECKOUT },
    children: [
      {
        path: '',
        component: () => import('../view/CheckoutDashboardView.vue'),
        meta: { roles: ROLE_GROUPS.CHECKOUT },
      },
      {
        path: 'table/:id',
        component: () => import('../view/BillingView.vue'),
        meta: { roles: ROLE_GROUPS.CHECKOUT },
      },
      {
        path: 'table/:id/payment',
        component: () => import('../view/PaymentView.vue'),
        meta: { roles: ROLE_GROUPS.CHECKOUT },
      },
    ],
  },
]

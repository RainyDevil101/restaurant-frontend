import type { RouteRecordRaw } from 'vue-router'
import { ROLE_GROUPS } from '@/modules/auth/constants'
import { Route } from '@/shared/types'
import { ROUTE_TITLES } from '@/shared/constants/brand'

export const checkoutRoutes: RouteRecordRaw[] = [
  {
    path: Route.CHECKOUT,
    component: () => import('../layout/CheckoutLayout.vue'),
    meta: { roles: ROLE_GROUPS.CHECKOUT },
    children: [
      {
        path: '',
        component: () => import('../view/CheckoutDashboardView.vue'),
        meta: { roles: ROLE_GROUPS.CHECKOUT, title: ROUTE_TITLES.CAJA },
      },
      {
        path: 'table/:id',
        component: () => import('../view/BillingView.vue'),
        meta: { roles: ROLE_GROUPS.CHECKOUT, title: ROUTE_TITLES.CUENTA },
      },
      {
        path: 'table/:id/payment',
        component: () => import('../view/PaymentView.vue'),
        meta: { roles: ROLE_GROUPS.CHECKOUT, title: ROUTE_TITLES.COBRO },
      },
    ],
  },
]

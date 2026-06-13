import type { RouteRecordRaw } from 'vue-router';
import { ROLE_GROUPS } from '@/modules/auth/constants';
import { Route } from '@/shared/types';
import { ROUTE_TITLES } from '@/shared/constants/brand';

export const serviceRoutes: RouteRecordRaw[] = [
  {
    path: Route.SERVICE,
    component: () => import('../layout/ServiceLayout.vue'),
    meta: { roles: ROLE_GROUPS.SERVICE },
    children: [
      {
        path: '',
        component: () => import('../view/TableSelectionView.vue'),
        meta: { roles: ROLE_GROUPS.SERVICE, title: ROUTE_TITLES.MESAS },
      },
    ],
  },
  {
    // Standalone — manages its own full-screen dark layout
    path: `${Route.SERVICE}/table/:id`,
    component: () => import('../view/OrderView.vue'),
    meta: { roles: ROLE_GROUPS.SERVICE, title: ROUTE_TITLES.TOMAR_PEDIDO },
  },
];

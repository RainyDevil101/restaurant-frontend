import type { RouteRecordRaw } from 'vue-router';
import { Role, Route } from '@/shared/types';
import { ROUTE_TITLES } from '@/shared/constants/brand';

export const manualRoutes: RouteRecordRaw[] = [
  {
    path: Route.MANUAL,
    component: () => import('../view/ManualView.vue'),
    meta: {
      roles: [Role.MESERO, Role.CAJERO, Role.ADMIN],
      title: ROUTE_TITLES.MANUAL,
    },
  },
];

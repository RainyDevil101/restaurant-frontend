import type { RouteRecordRaw } from 'vue-router';
import { ROLE_GROUPS } from '@/modules/auth/constants';
import { Route } from '@/shared/types';
import { ROUTE_TITLES } from '@/shared/constants/brand';

export const adminRoutes: RouteRecordRaw[] = [
  {
    path: Route.ADMIN,
    component: () => import('../layout/AdminLayout.vue'),
    meta: { roles: ROLE_GROUPS.ADMIN },
    children: [
      { path: '', redirect: Route.ADMIN_PRODUCTS },
      {
        path: 'products',
        component: () => import('../view/ProductsView.vue'),
        meta: { roles: ROLE_GROUPS.ADMIN, title: ROUTE_TITLES.PRODUCTOS },
      },
      {
        path: 'categories',
        component: () => import('../view/CategoriesView.vue'),
        meta: { roles: ROLE_GROUPS.ADMIN, title: ROUTE_TITLES.CATEGORIAS },
      },
      {
        path: 'menus',
        component: () => import('../view/MenusView.vue'),
        meta: { roles: ROLE_GROUPS.ADMIN, title: ROUTE_TITLES.MENUS },
      },
      {
        path: 'areas',
        component: () => import('../view/AreasView.vue'),
        meta: { roles: ROLE_GROUPS.ADMIN, title: ROUTE_TITLES.AREAS },
      },
      {
        path: 'tables',
        component: () => import('../view/TablesView.vue'),
        meta: { roles: ROLE_GROUPS.ADMIN, title: ROUTE_TITLES.MESAS },
      },
      {
        path: 'users',
        component: () => import('../view/UsersView.vue'),
        meta: { roles: ROLE_GROUPS.ADMIN, title: ROUTE_TITLES.USUARIOS },
      },
      {
        path: 'payments',
        component: () => import('../view/PaymentsView.vue'),
        meta: { roles: ROLE_GROUPS.ADMIN, title: ROUTE_TITLES.PAGOS },
      },
      {
        path: 'settings',
        component: () => import('../view/SettingsView.vue'),
        meta: { roles: ROLE_GROUPS.ADMIN, title: ROUTE_TITLES.CONFIGURACION },
      },
    ],
  },
];

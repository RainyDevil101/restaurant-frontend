import type { RouteRecordRaw } from 'vue-router'
import { ROLE_GROUPS } from '@/modules/auth/constants'

export const adminRoutes: RouteRecordRaw[] = [
  {
    path: '/admin',
    component: () => import('../layout/AdminLayout.vue'),
    meta: { roles: ROLE_GROUPS.ADMIN },
    children: [
      { path: '', component: () => import('../view/AdminDashboardView.vue'), meta: { roles: ROLE_GROUPS.ADMIN } },
      { path: 'products', component: () => import('../view/ProductsView.vue'), meta: { roles: ROLE_GROUPS.ADMIN } },
      { path: 'categories', component: () => import('../view/CategoriesView.vue'), meta: { roles: ROLE_GROUPS.ADMIN } },
      { path: 'menus', component: () => import('../view/MenusView.vue'), meta: { roles: ROLE_GROUPS.ADMIN } },
      { path: 'areas', component: () => import('../view/AreasView.vue'), meta: { roles: ROLE_GROUPS.ADMIN } },
      { path: 'tables', component: () => import('../view/TablesView.vue'), meta: { roles: ROLE_GROUPS.ADMIN } },
      { path: 'users', component: () => import('../view/UsersView.vue'), meta: { roles: ROLE_GROUPS.ADMIN } },
      { path: 'reports', component: () => import('../view/ReportsView.vue'), meta: { roles: ROLE_GROUPS.ADMIN } },
    ],
  },
]

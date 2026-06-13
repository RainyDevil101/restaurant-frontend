import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/modules/auth/store';
import { Role, Route } from '@/shared/types';
import { brandTitle } from '@/shared/constants/brand';
import { authRoutes } from '@/modules/auth/route';
import { serviceRoutes } from '@/modules/service/route';
import { checkoutRoutes } from '@/modules/checkout/route';
import { adminRoutes } from '@/modules/admin/route';

declare module 'vue-router' {
  interface RouteMeta {
    roles?: Role[];
    title?: string;
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...authRoutes,
    ...serviceRoutes,
    ...checkoutRoutes,
    ...adminRoutes,
    { path: '/:pathMatch(.*)*', redirect: Route.LOGIN },
  ],
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  const roles = to.meta.roles;

  if (!auth.isLoggedIn && roles) return Route.LOGIN;

  if (auth.isLoggedIn && to.path === Route.LOGIN) return auth.roleHome;

  if (roles && !roles.includes(auth.user!.role)) return auth.roleHome;

  return true;
});

router.afterEach((to) => {
  document.title = brandTitle(to.meta.title);
});

export default router;

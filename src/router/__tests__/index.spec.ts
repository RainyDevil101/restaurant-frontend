import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { flushPromises } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import type { Router, RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/modules/auth/store';
import type { User } from '@/modules/auth/store';
import { Role, Route } from '@/shared/types';
import { brandTitle, DEFAULT_TITLE } from '@/shared/constants/brand';
import { authRoutes } from '@/modules/auth/route';
import { serviceRoutes } from '@/modules/service/route';
import { checkoutRoutes } from '@/modules/checkout/route';
import { adminRoutes } from '@/modules/admin/route';

// The exported router uses createWebHistory, which does not become ready in
// jsdom (its lazy async component imports hang router.isReady()). We rebuild
// an equivalent router from the SAME route modules over createMemoryHistory,
// swap the lazy `component: () => import(...)` for instant stubs so navigation
// resolves synchronously, and attach the SAME guard + afterEach logic copied
// verbatim from src/router/index.ts. The guard is what we are testing.

const stub = { template: '<div />' };

function stubComponents(routes: RouteRecordRaw[]): RouteRecordRaw[] {
  return routes.map((r) => {
    const next = { ...r } as RouteRecordRaw;
    if ('component' in next && next.component) next.component = stub;
    if (next.children) next.children = stubComponents(next.children);
    return next;
  });
}

function buildRouter(): Router {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      ...stubComponents(authRoutes),
      ...stubComponents(serviceRoutes),
      ...stubComponents(checkoutRoutes),
      ...stubComponents(adminRoutes),
      { path: '/:pathMatch(.*)*', redirect: Route.LOGIN },
    ],
  });

  // --- guard logic copied verbatim from src/router/index.ts ---
  router.beforeEach((to) => {
    const auth = useAuthStore();
    const roles = to.meta.roles as Role[] | undefined;

    if (!auth.isLoggedIn && roles) return Route.LOGIN;

    if (auth.isLoggedIn && to.path === Route.LOGIN) return auth.roleHome;

    if (roles && !roles.includes(auth.user!.role)) return auth.roleHome;

    return true;
  });

  router.afterEach((to) => {
    document.title = brandTitle(to.meta.title as string | undefined);
  });

  return router;
}

const makeUser = (role: Role): User => ({
  id: 'u1',
  name: 'Test',
  email: 'test@subito.mx',
  role,
  active: true,
  isOwner: false,
});

let router: Router;

async function go(path: string): Promise<string> {
  try {
    await router.push(path);
  } catch {
    // a redirect from within the guard can reject the navigation promise
  }
  await flushPromises();
  return router.currentRoute.value.path;
}

function loginAs(role: Role): void {
  useAuthStore().login(makeUser(role), 'tok');
}

describe('router guard', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
    router = buildRouter();
  });

  describe('unauthenticated access to protected routes redirects to /login', () => {
    it('redirects /admin to /login', async () => {
      expect(await go(Route.ADMIN)).toBe(Route.LOGIN);
    });

    it('redirects /service to /login', async () => {
      expect(await go(Route.SERVICE)).toBe(Route.LOGIN);
    });

    it('redirects /checkout to /login', async () => {
      expect(await go(Route.CHECKOUT)).toBe(Route.LOGIN);
    });
  });

  describe('authenticated user on /login is sent to its role home', () => {
    it('mesero on /login goes to /service', async () => {
      loginAs(Role.MESERO);
      expect(await go(Route.LOGIN)).toBe(Route.SERVICE);
    });

    it('cajero on /login goes to /checkout', async () => {
      loginAs(Role.CAJERO);
      expect(await go(Route.LOGIN)).toBe(Route.CHECKOUT);
    });

    it('admin on /login goes to /admin (which redirects to products)', async () => {
      loginAs(Role.ADMIN);
      expect(await go(Route.LOGIN)).toBe(Route.ADMIN_PRODUCTS);
    });
  });

  describe('wrong role is redirected to its own role home', () => {
    it('mesero hitting /admin is redirected to /service', async () => {
      loginAs(Role.MESERO);
      expect(await go(Route.ADMIN)).toBe(Route.SERVICE);
    });

    it('cajero hitting /admin is redirected to /checkout', async () => {
      loginAs(Role.CAJERO);
      expect(await go(Route.ADMIN)).toBe(Route.CHECKOUT);
    });

    it('mesero hitting /checkout is redirected to /service', async () => {
      loginAs(Role.MESERO);
      expect(await go(Route.CHECKOUT)).toBe(Route.SERVICE);
    });
  });

  describe('correct role lands on the requested path', () => {
    it('mesero reaches /service', async () => {
      loginAs(Role.MESERO);
      expect(await go(Route.SERVICE)).toBe(Route.SERVICE);
    });

    it('cajero reaches /checkout', async () => {
      loginAs(Role.CAJERO);
      expect(await go(Route.CHECKOUT)).toBe(Route.CHECKOUT);
    });

    it('admin reaches /admin/users', async () => {
      loginAs(Role.ADMIN);
      expect(await go(Route.ADMIN_USERS)).toBe(Route.ADMIN_USERS);
    });

    it('admin can also reach a service route (admin is in every role group)', async () => {
      loginAs(Role.ADMIN);
      expect(await go(Route.SERVICE)).toBe(Route.SERVICE);
    });
  });

  describe('catch-all unknown path redirects to /login', () => {
    it('redirects an unknown path to /login when unauthenticated', async () => {
      expect(await go('/this/does/not/exist')).toBe(Route.LOGIN);
    });

    it('an authenticated user hitting an unknown path lands on its role home', async () => {
      // The catch-all redirects to /login; the guard then bounces a logged-in
      // user from /login to its role home.
      loginAs(Role.CAJERO);
      expect(await go('/nope')).toBe(Route.CHECKOUT);
    });
  });

  describe('afterEach sets document.title via brandTitle', () => {
    it('a titled route gets "<Title> · Subito"', async () => {
      loginAs(Role.ADMIN);
      await go(Route.ADMIN_USERS);
      expect(document.title).toBe('Usuarios · Subito');
    });

    it('the login route (no title) gets the DEFAULT_TITLE', async () => {
      await go(Route.LOGIN);
      expect(document.title).toBe(DEFAULT_TITLE);
    });
  });
});

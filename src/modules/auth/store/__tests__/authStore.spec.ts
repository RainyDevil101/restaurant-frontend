import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../index';
import { Role, Route } from '@/shared/types';

const makeUser = (role: Role) => ({
  id: 'u1',
  name: 'Test',
  email: 'test@subito.mx',
  role,
  active: true,
  isOwner: false,
});

describe('useAuthStore', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  it('starts unauthenticated when no session exists', () => {
    const store = useAuthStore();
    expect(store.isLoggedIn).toBe(false);
    expect(store.user).toBeNull();
    expect(store.token).toBeNull();
  });

  it('isLoggedIn becomes true after login', () => {
    const store = useAuthStore();
    store.login(makeUser(Role.MESERO), 'tok');
    expect(store.isLoggedIn).toBe(true);
  });

  it('roleHome is /login when unauthenticated', () => {
    const store = useAuthStore();
    expect(store.roleHome).toBe(Route.LOGIN);
  });

  it('roleHome is /service for mesero', () => {
    const store = useAuthStore();
    store.login(makeUser(Role.MESERO), 'tok');
    expect(store.roleHome).toBe(Route.SERVICE);
  });

  it('roleHome is /checkout for cajero', () => {
    const store = useAuthStore();
    store.login(makeUser(Role.CAJERO), 'tok');
    expect(store.roleHome).toBe(Route.CHECKOUT);
  });

  it('roleHome is /admin for admin', () => {
    const store = useAuthStore();
    store.login(makeUser(Role.ADMIN), 'tok');
    expect(store.roleHome).toBe(Route.ADMIN);
  });

  it('login persists the session to localStorage', () => {
    const store = useAuthStore();
    store.login(makeUser(Role.MESERO), 'tok');
    expect(localStorage.getItem('subito.session')).not.toBeNull();
  });

  it('logout clears user, token, and localStorage', () => {
    const store = useAuthStore();
    store.login(makeUser(Role.MESERO), 'tok');
    store.logout();
    expect(store.isLoggedIn).toBe(false);
    expect(store.user).toBeNull();
    expect(store.token).toBeNull();
    expect(localStorage.getItem('subito.session')).toBeNull();
  });
});

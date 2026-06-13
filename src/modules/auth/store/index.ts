import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { loadSession, saveSession, clearSession } from '@/shared/session';
import { Role, Route } from '@/shared/types';

export { Role };

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  isOwner: boolean;
}

export const useAuthStore = defineStore('auth', () => {
  const persisted = loadSession();
  const user = ref<User | null>(persisted?.user ?? null);
  const token = ref<string | null>(persisted?.token ?? null);

  const isLoggedIn = computed(() => user.value !== null);

  const roleHome = computed((): string => {
    switch (user.value?.role) {
      case Role.MESERO:
        return Route.SERVICE;
      case Role.CAJERO:
        return Route.CHECKOUT;
      case Role.ADMIN:
        return Route.ADMIN;
      default:
        return Route.LOGIN;
    }
  });

  function login(newUser: User, newToken: string) {
    user.value = newUser;
    token.value = newToken;
    saveSession({ token: newToken, user: newUser });
  }

  function logout() {
    user.value = null;
    token.value = null;
    clearSession();
  }

  return { user, token, isLoggedIn, roleHome, login, logout };
});

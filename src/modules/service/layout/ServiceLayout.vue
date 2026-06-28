<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/modules/auth/store';
import { Role, Route } from '@/shared/types';
import { colors } from '@/shared/styles/colors';
import BrandLogo from '@/shared/components/BrandLogo.vue';

const router = useRouter();
const auth = useAuthStore();
const isAdmin = auth.user?.role === Role.ADMIN;

function logout() {
  auth.logout();
  router.push(Route.LOGIN);
}
</script>

<template>
  <div class="service-layout">
    <header class="header">
      <div class="header-left">
        <button
          v-if="isAdmin"
          class="menu-btn"
          aria-label="Volver a administración"
          @click="router.push(Route.ADMIN)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="22"
            height="22"
            aria-hidden="true"
          >
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
          <span class="back-label">Admin</span>
        </button>
        <BrandLogo size="1.25rem" variant="onColor" />
      </div>
      <div class="user-info">
        <div class="avatar" aria-hidden="true">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="22"
            height="22"
          >
            <path
              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
            />
          </svg>
        </div>
        <span class="user-name">{{ auth.user?.name }}</span>
        <button class="help-btn" aria-label="Abrir manual" @click="router.push(Route.MANUAL)">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="22"
            height="22"
            aria-hidden="true"
          >
            <path
              d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"
            />
          </svg>
        </button>
        <button class="logout-btn" aria-label="Cerrar sesión" @click="logout">Salir</button>
      </div>
    </header>

    <main id="main" tabindex="-1" class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.service-layout {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

.header {
  background: var(--color-primary);
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: white;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.menu-btn {
  background: none;
  border: none;
  color: white;
  padding: 0.375rem 0.5rem;
  min-height: 2.5rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  flex-shrink: 0;
}

.menu-btn:active {
  background: rgba(255, 255, 255, 0.15);
}

.back-label {
  font-size: 0.875rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
  min-width: 0;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  color: v-bind('colors.brand.primary');
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-name {
  font-size: 0.95rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.help-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.75rem;
  min-height: 2.75rem;
  background: none;
  border: none;
  color: white;
  border-radius: 6px;
  flex-shrink: 0;
}

.help-btn:active {
  background: rgba(255, 255, 255, 0.15);
}

.logout-btn {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  padding: 0.5rem 0.875rem;
  min-height: 2.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  flex-shrink: 0;
}

.logout-btn:active {
  background: rgba(255, 255, 255, 0.28);
}

.content {
  flex: 1;
  padding: 1.25rem;
}

@media (max-width: 400px) {
  .back-label {
    display: none;
  }
}
</style>

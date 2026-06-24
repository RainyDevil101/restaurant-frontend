<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/modules/auth/store';
import { Role, Route } from '@/shared/types';
import BrandLogo from '@/shared/components/BrandLogo.vue';
import { colors } from '@/shared/styles/colors';

const router = useRouter();
const auth = useAuthStore();
const isAdmin = auth.user?.role === Role.ADMIN;

function logout() {
  auth.logout();
  router.push(Route.LOGIN);
}
</script>

<template>
  <div class="checkout-layout">
    <header class="header">
      <div class="brand">
        <BrandLogo size="1.25rem" />
        <span class="brand-section">· Caja</span>
      </div>
      <div class="header-right">
        <button v-if="isAdmin" class="admin-back-btn" @click="router.push(Route.ADMIN)">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="16"
            height="16"
            aria-hidden="true"
          >
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
          Admin
        </button>
        <div class="live-indicator">
          <span class="live-dot" aria-hidden="true" />
          <span>En vivo</span>
        </div>
        <button class="help-btn" aria-label="Abrir manual" @click="router.push(Route.MANUAL)">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="16"
            height="16"
            aria-hidden="true"
          >
            <path
              d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"
            />
          </svg>
          <span>Manual</span>
        </button>
        <div class="user-info">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            width="18"
            height="18"
            aria-hidden="true"
          >
            <path
              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
            />
          </svg>
          <span>{{ auth.user?.name }}</span>
        </div>
        <button class="logout-btn" @click="logout">Salir</button>
      </div>
    </header>

    <main id="main" tabindex="-1" class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.checkout-layout {
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: #f0f2f5;
}

.header {
  flex-shrink: 0;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 0 1.5rem;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: baseline;
  gap: 6px;
}

.brand-section {
  font-size: 1rem;
  color: v-bind('colors.neutral.mutedText');
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.live-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: #374151;
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: #374151;
}

.admin-back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: 1.5px solid #e5e7eb;
  border-radius: 6px;
  padding: 5px 10px;
  font-size: var(--font-xs);
  font-weight: 600;
  color: #6b7280;
  transition:
    background 0.12s,
    color 0.12s;
}

.admin-back-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.help-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  min-height: 2.75rem;
  background: none;
  border: 1.5px solid #e5e7eb;
  border-radius: 6px;
  padding: 5px 10px;
  font-size: var(--font-xs);
  font-weight: 600;
  color: v-bind('colors.neutral.mutedText');
  transition:
    background 0.12s,
    color 0.12s;
}

.help-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.logout-btn {
  background: none;
  border: 1.5px solid #fecaca;
  border-radius: 6px;
  padding: 5px 12px;
  font-size: var(--font-xs);
  font-weight: 600;
  color: #dc2626;
  transition: background 0.12s;
}

.logout-btn:hover {
  background: #fef2f2;
}

.content {
  flex: 1;
  overflow: hidden;
}
</style>

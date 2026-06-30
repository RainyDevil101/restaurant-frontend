<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/modules/auth/store';
import { Role, Route } from '@/shared/types';
import BrandLogo from '@/shared/components/BrandLogo.vue';
import { ROUTE_TITLES } from '@/shared/constants/brand';
import { CHECKOUT_LABELS } from '../domain';
import { colors } from '@/shared/styles/colors';
import { ArrowLeftIcon, QuestionMarkCircleIcon, UserIcon } from '@/modules/shared/components/icons';

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
        <span class="brand-section">· {{ ROUTE_TITLES.CAJA }}</span>
      </div>
      <div class="header-right">
        <button v-if="isAdmin" class="admin-back-btn" @click="router.push(Route.ADMIN)">
          <ArrowLeftIcon :size="16" />
          {{ CHECKOUT_LABELS.layout.admin }}
        </button>
        <div class="live-indicator">
          <span class="live-dot" aria-hidden="true" />
          <span>{{ CHECKOUT_LABELS.layout.live }}</span>
        </div>
        <button
          class="help-btn"
          :aria-label="CHECKOUT_LABELS.layout.manualAria"
          @click="router.push(Route.MANUAL)"
        >
          <QuestionMarkCircleIcon :size="16" />
          <span>{{ ROUTE_TITLES.MANUAL }}</span>
        </button>
        <div class="user-info">
          <UserIcon :size="18" />
          <span>{{ auth.user?.name }}</span>
        </div>
        <button class="logout-btn" @click="logout">{{ CHECKOUT_LABELS.layout.logoutShort }}</button>
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

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/modules/auth/store';
import { Role, Route } from '@/shared/types';
import { colors } from '@/shared/styles/colors';
import { UI_LABELS } from '@/shared/constants/ui';
import { SERVICE_LABELS } from '../domain';
import BrandLogo from '@/shared/components/BrandLogo.vue';
import { ArrowLeftIcon, UserIcon, QuestionMarkCircleIcon } from '@/modules/shared/components/icons';

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
          :aria-label="SERVICE_LABELS.layout.backToAdminAria"
          @click="router.push(Route.ADMIN)"
        >
          <ArrowLeftIcon :size="22" />
          <span class="back-label">{{ SERVICE_LABELS.layout.admin }}</span>
        </button>
        <BrandLogo size="1.25rem" variant="onColor" />
      </div>
      <div class="user-info">
        <div class="avatar" aria-hidden="true">
          <UserIcon :size="22" />
        </div>
        <span class="user-name">{{ auth.user?.name }}</span>
        <button
          class="help-btn"
          :aria-label="SERVICE_LABELS.layout.openManualAria"
          @click="router.push(Route.MANUAL)"
        >
          <QuestionMarkCircleIcon :size="22" />
        </button>
        <button class="logout-btn" :aria-label="UI_LABELS.logout" @click="logout">
          {{ SERVICE_LABELS.layout.logoutShort }}
        </button>
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

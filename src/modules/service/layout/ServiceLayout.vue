<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/auth/store'
import { Role, Route } from '@/shared/types'
import { colors } from '@/shared/styles/colors'
import BrandLogo from '@/shared/components/BrandLogo.vue'

const router = useRouter()
const auth = useAuthStore()
const isAdmin = auth.user?.role === Role.ADMIN

function logout() {
  auth.logout()
  router.push(Route.LOGIN)
}
</script>

<template>
  <div class="service-layout">
    <header class="header">
      <div class="header-left">
        <button v-if="isAdmin" class="menu-btn" aria-label="Volver a administración" @click="router.push(Route.ADMIN)">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22"
            aria-hidden="true">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
          <span class="back-label">Admin</span>
        </button>
        <BrandLogo size="1.25rem" variant="onColor" />
      </div>
      <div class="user-info">
        <div class="avatar" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path
              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        </div>
        <span class="user-name">{{ auth.user?.name }}</span>
        <button class="logout-btn" aria-label="Cerrar sesión" @click="logout">Salir</button>
      </div>
    </header>

    <main class="content">
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
  padding: 0.875rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.menu-btn {
  background: none;
  border: none;
  color: white;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
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
  gap: 8px;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: white;
  color: v-bind('colors.brand.primary');
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-name {
  font-size: 1.1rem;
  font-weight: 600;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
}

.logout-btn:active {
  background: rgba(255, 255, 255, 0.28);
}

.content {
  flex: 1;
  padding: 1.25rem;
}
</style>

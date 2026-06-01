<script setup lang="ts">
import { useAuthStore } from '@/modules/auth/store'

const auth = useAuthStore()
</script>

<template>
  <div class="service-layout">
    <header class="header">
      <button class="menu-btn" aria-label="Abrir menú">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="26"
          height="26"
          aria-hidden="true"
        >
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
        </svg>
      </button>

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
      </div>
    </header>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.service-layout {
  min-height: 100vh;
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

.menu-btn {
  background: none;
  border: none;
  color: white;
  padding: 4px;
  display: flex;
  align-items: center;
  border-radius: 6px;
}

.menu-btn:active {
  background: rgba(255, 255, 255, 0.15);
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
  color: #7c5cbf;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-name {
  font-size: 1.1rem;
  font-weight: 600;
}

.content {
  flex: 1;
  padding: 1.25rem;
}
</style>

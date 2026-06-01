<script setup lang="ts">
import { useAuthStore } from '@/modules/auth/store'

const auth = useAuthStore()
</script>

<template>
  <div class="checkout-layout">
    <header class="header">
      <div class="brand">
        <span class="brand-name">Subito</span>
        <span class="brand-section">· Caja</span>
      </div>
      <div class="header-right">
        <div class="live-indicator">
          <span class="live-dot" aria-hidden="true" />
          <span>En vivo</span>
        </div>
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
      </div>
    </header>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.checkout-layout {
  height: 100vh;
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

.brand-name {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-primary);
}

.brand-section {
  font-size: 1rem;
  color: #9ca3af;
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
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.875rem;
  color: #374151;
}

.content {
  flex: 1;
  overflow: hidden;
}
</style>

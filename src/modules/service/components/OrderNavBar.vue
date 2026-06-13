<script setup lang="ts">
import BrandLogo from '@/shared/components/BrandLogo.vue'

defineProps<{ userName: string | undefined }>()
defineEmits<{ back: [] }>()
</script>

<template>
  <header class="nav-bar">
    <button class="back-btn" @click="$emit('back')">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        width="18"
        height="18"
        aria-hidden="true"
      >
        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
      </svg>
      <span>Mesas</span>
    </button>

    <BrandLogo size="1.1rem" variant="onColor" />

    <div class="user-info">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        width="20"
        height="20"
        aria-hidden="true"
      >
        <path
          d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
        />
      </svg>
      <span>{{ userName }}</span>
    </div>
  </header>
</template>

<style scoped>
.nav-bar {
  flex-shrink: 0;
  background: var(--color-primary);
  padding: 0.875rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  color: white;
  font-size: 0.9rem;
  padding: 4px;
  border-radius: 6px;
}

.back-btn:active {
  background: rgba(255, 255, 255, 0.15);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
}
</style>

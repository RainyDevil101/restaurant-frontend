<script setup lang="ts">
import BrandLogo from '@/shared/components/BrandLogo.vue';
import { ROUTE_TITLES } from '@/shared/constants/brand';
import { ArrowLeftIcon, UserIcon } from '@/modules/shared/components/icons';

defineProps<{ userName: string | undefined }>();
defineEmits<{ back: [] }>();
</script>

<template>
  <header class="nav-bar">
    <button class="back-btn" @click="$emit('back')">
      <ArrowLeftIcon :size="18" />
      <span>{{ ROUTE_TITLES.MESAS }}</span>
    </button>

    <BrandLogo size="1.1rem" variant="onColor" />

    <div class="user-info">
      <UserIcon :size="20" />
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

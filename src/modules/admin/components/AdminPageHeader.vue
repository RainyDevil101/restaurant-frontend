<script setup lang="ts">
import { PlusIcon } from '@/modules/shared/components/icons';

defineProps<{
  title: string;
  newLabel: string;
}>();

defineEmits<{
  create: [];
}>();
</script>

<template>
  <div class="page-header">
    <h1 class="page-title">{{ title }}</h1>
    <button class="new-btn" @click="$emit('create')">
      <PlusIcon :size="18" />
      {{ newLabel }}
    </button>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #111827;
}

.new-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  transition: background 0.15s;
}

.new-btn:hover {
  background: var(--color-primary-dark);
}
</style>

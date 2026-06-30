<script setup lang="ts">
import { SERVICE_LABELS } from '../domain';

defineProps<{ tableName: string }>();
</script>

<template>
  <div class="order-header">
    <h1 class="order-title">{{ SERVICE_LABELS.orderHeader.title }}</h1>
    <span class="table-badge">{{ tableName }}</span>
  </div>
</template>

<style scoped>
.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.order-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1a1a1a;
}

.table-badge {
  background: var(--color-primary);
  color: white;
  padding: 5px 14px;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
}
</style>

<script setup lang="ts">
import type { Table } from '@/shared/types'

defineProps<{ table: Table }>()
</script>

<template>
  <RouterLink :to="`/service/table/${table.id}`" class="table-card" :class="table.status">
    <span class="table-name">{{ table.name }}</span>
    <div class="table-capacity">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        width="20"
        height="20"
        aria-hidden="true"
      >
        <path
          d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 13.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5C23 14.17 18.33 13 16 13z"
        />
      </svg>
      <span>{{ table.capacity }} pers.</span>
    </div>
  </RouterLink>
</template>

<style scoped>
.table-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border-radius: 10px;
  cursor: pointer;
  transition: filter 0.15s ease;
}

.table-card:active {
  filter: brightness(0.95);
}

.table-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a1a;
}

.table-capacity {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #555;
  font-size: 0.9rem;
}

.libre {
  background: #dff0e5;
}

.ocupada {
  background: #dce4f2;
}

.por_cobrar {
  background: #fef3ce;
}
</style>

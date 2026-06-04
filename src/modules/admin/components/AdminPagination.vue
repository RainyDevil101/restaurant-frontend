<script setup lang="ts">
defineProps<{
  page: number
  pageSize: number
  totalPages: number
  pageSizeOptions: readonly number[]
}>()

defineEmits<{
  'update:page': [value: number]
  'update:pageSize': [value: number]
}>()
</script>

<template>
  <div class="pagination">
    <div class="page-size">
      <label for="admin-page-size">Filas por página</label>
      <select
        id="admin-page-size"
        :value="pageSize"
        class="page-size-select"
        @change="$emit('update:pageSize', Number(($event.target as HTMLSelectElement).value))"
      >
        <option v-for="size in pageSizeOptions" :key="size" :value="size">{{ size }}</option>
      </select>
    </div>
    <div class="page-nav">
      <button
        type="button"
        class="page-btn"
        :disabled="page <= 1"
        aria-label="Página anterior"
        @click="$emit('update:page', page - 1)"
      >◀</button>
      <span class="page-status">Página {{ page }} de {{ totalPages }}</span>
      <button
        type="button"
        class="page-btn"
        :disabled="page >= totalPages"
        aria-label="Página siguiente"
        @click="$emit('update:page', page + 1)"
      >▶</button>
    </div>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.page-size {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #6b7280;
}

.page-size-select {
  padding: 6px 10px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.85rem;
  color: #111827;
  font-family: inherit;
  background: white;
  outline: none;
}

.page-size-select:focus {
  border-color: var(--color-primary);
}

.page-nav {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-status {
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
}

.page-btn {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 8px;
  font-size: 0.8rem;
}

.page-btn:hover:not(:disabled) {
  background: #e5e7eb;
}

.page-btn:disabled {
  color: #d1d5db;
  cursor: not-allowed;
}
</style>

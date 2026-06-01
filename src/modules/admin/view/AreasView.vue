<script setup lang="ts">
import { useAreas } from '../composables/useAreas'

const { areas } = useAreas()
</script>

<template>
  <div class="areas-view">
    <div class="page-header">
      <h1 class="page-title">Áreas</h1>
      <button class="new-btn">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="18"
          height="18"
          aria-hidden="true"
        >
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
        Nueva área
      </button>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th class="col-right">Mesas</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="area in areas" :key="area.id" class="data-row">
          <td>
            <span class="area-name">{{ area.name }}</span>
          </td>
          <td class="col-right">{{ area.tableCount }} mesas</td>
        </tr>

        <tr v-if="areas.length === 0">
          <td colspan="2" class="empty-row">Sin áreas registradas</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.areas-view {
  padding: 1.75rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

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

/* Table */
.data-table {
  width: 100%;
  border-collapse: collapse;
}

thead th {
  padding: 10px 12px;
  text-align: left;
  font-size: 0.8rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1.5px solid #e5e7eb;
}

.col-right {
  text-align: right;
}

.data-row td {
  padding: 14px 12px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.9rem;
  vertical-align: middle;
}

.data-row:last-child td {
  border-bottom: none;
}

.data-row:hover td {
  background: #fafafa;
}

.area-name {
  font-weight: 600;
  color: #111827;
}

.empty-row {
  text-align: center;
  color: #9ca3af;
  padding: 2.5rem 0;
}
</style>

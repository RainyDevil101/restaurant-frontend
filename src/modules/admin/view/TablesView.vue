<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAdminTables } from '../composables/useAdminTables'
import ModalDialog from '../components/ModalDialog.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { ApiRequestError } from '@/shared/api/client'
import { ADMIN_LABELS, TABLE_CAPACITY_MAX, PAGE_SIZE_OPTIONS } from '../constants'
import type { TableRow } from '../composables/useAdminTables'

const {
  tables,
  areas,
  search,
  loading,
  error,
  page,
  pageSize,
  totalPages,
  fillerCount,
  sortBy,
  sortDir,
  toggleSort,
  setPage,
  createTable,
  updateTable,
  removeTable,
} = useAdminTables()

const STATUS_MAP = ADMIN_LABELS.table.statusLabels

const dialogOpen = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const formError = ref('')
const form = reactive({ name: '', capacity: 2, areaId: '' })

function openCreate() {
  editingId.value = null
  form.name = ''
  form.capacity = 2
  form.areaId = areas.value[0]?.id ?? ''
  formError.value = ''
  dialogOpen.value = true
}

function openEdit(table: TableRow) {
  editingId.value = table.id
  form.name = table.name
  form.capacity = table.capacity
  form.areaId = table.areaId
  formError.value = ''
  dialogOpen.value = true
}

function clampCapacity() {
  form.capacity = Math.round(form.capacity)
  if (form.capacity > TABLE_CAPACITY_MAX) form.capacity = TABLE_CAPACITY_MAX
  if (form.capacity < 1) form.capacity = 1
}

async function save() {
  const trimmedName = form.name.trim()
  if (!trimmedName) {
    formError.value = ADMIN_LABELS.table.nameRequired
    return
  }
  if (!form.areaId) {
    formError.value = ADMIN_LABELS.table.areaRequired
    return
  }
  if (!Number.isInteger(form.capacity) || form.capacity < 1 || form.capacity > TABLE_CAPACITY_MAX) {
    formError.value = ADMIN_LABELS.table.capacityInvalid
    return
  }
  saving.value = true
  formError.value = ''
  const payload = { name: trimmedName, capacity: form.capacity, areaId: form.areaId }
  try {
    if (editingId.value) await updateTable(editingId.value, payload)
    else await createTable(payload)
    dialogOpen.value = false
  } catch (err) {
    formError.value = err instanceof ApiRequestError ? err.message : 'No se pudo guardar.'
  } finally {
    saving.value = false
  }
}

const confirmOpen = ref(false)
const deletingId = ref<string | null>(null)
const deleting = ref(false)
const deleteError = ref('')

function openDelete(id: string) {
  deletingId.value = id
  deleteError.value = ''
  confirmOpen.value = true
}

async function confirmDelete() {
  if (!deletingId.value) return
  deleting.value = true
  deleteError.value = ''
  try {
    await removeTable(deletingId.value)
    confirmOpen.value = false
  } catch (err) {
    deleteError.value = err instanceof ApiRequestError ? err.message : 'No se pudo eliminar.'
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="tables-view">
    <div class="page-header">
      <h1 class="page-title">Mesas</h1>
      <button class="new-btn" @click="openCreate">
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
        Nueva mesa
      </button>
    </div>

    <div class="search-wrap">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        width="16"
        height="16"
        class="search-icon"
        aria-hidden="true"
      >
        <path
          d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
        />
      </svg>
      <input v-model="search" class="search-input" placeholder="Buscar mesa..." />
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>
            <button type="button" class="sort-header" @click="toggleSort('name')">
              Mesa
              <span class="sort-indicator">{{ sortBy === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : '' }}</span>
            </button>
          </th>
          <th>
            <button type="button" class="sort-header" @click="toggleSort('areaName')">
              Área
              <span class="sort-indicator">{{ sortBy === 'areaName' ? (sortDir === 'asc' ? '▲' : '▼') : '' }}</span>
            </button>
          </th>
          <th class="col-right">
            <button type="button" class="sort-header sort-header-right" @click="toggleSort('capacity')">
              Capacidad
              <span class="sort-indicator">{{ sortBy === 'capacity' ? (sortDir === 'asc' ? '▲' : '▼') : '' }}</span>
            </button>
          </th>
          <th class="col-right">
            <button type="button" class="sort-header sort-header-right" @click="toggleSort('status')">
              Estado
              <span class="sort-indicator">{{ sortBy === 'status' ? (sortDir === 'asc' ? '▲' : '▼') : '' }}</span>
            </button>
          </th>
          <th class="col-actions">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="table in tables" :key="table.id" class="data-row">
          <td>
            <span class="table-name">{{ table.name }}</span>
          </td>
          <td class="col-muted">{{ table.areaName }}</td>
          <td class="col-right">{{ table.capacity }} pers.</td>
          <td class="col-right">
            <span
              class="status-label"
              :style="{ color: STATUS_MAP[table.status]?.color ?? '#6b7280' }"
            >
              {{ STATUS_MAP[table.status]?.label ?? table.status }}
            </span>
          </td>
          <td class="col-actions">
            <div class="row-actions">
              <button class="action-btn" @click="openEdit(table)">Editar</button>
              <button class="action-btn danger" @click="openDelete(table.id)">Eliminar</button>
            </div>
          </td>
        </tr>

        <tr
          v-for="i in tables.length === 0 ? 0 : fillerCount"
          :key="'filler-' + i"
          class="filler-row"
          aria-hidden="true"
        >
          <td colspan="5"></td>
        </tr>

        <tr v-if="tables.length === 0">
          <td colspan="5" class="empty-row">
            <span v-if="loading">Cargando…</span>
            <span v-else-if="error" class="error-text">{{ error }}</span>
            <span v-else>Sin resultados</span>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="pagination">
      <div class="page-size">
        <label for="page-size">Filas por página</label>
        <select id="page-size" v-model.number="pageSize" class="page-size-select">
          <option v-for="size in PAGE_SIZE_OPTIONS" :key="size" :value="size">{{ size }}</option>
        </select>
      </div>
      <div class="page-nav">
        <button
          type="button"
          class="page-btn"
          :disabled="page <= 1"
          aria-label="Página anterior"
          @click="setPage(page - 1)"
        >◀</button>
        <span class="page-status">Página {{ page }} de {{ totalPages }}</span>
        <button
          type="button"
          class="page-btn"
          :disabled="page >= totalPages"
          aria-label="Página siguiente"
          @click="setPage(page + 1)"
        >▶</button>
      </div>
    </div>

    <ModalDialog
      v-if="dialogOpen"
      :title="editingId ? 'Editar mesa' : 'Nueva mesa'"
      :saving="saving"
      :error="formError"
      @close="dialogOpen = false"
      @submit="save"
    >
      <div class="field">
        <label class="field-label" for="table-name">Nombre</label>
        <input id="table-name" v-model="form.name" class="field-input" required />
      </div>
      <div class="field">
        <label class="field-label" for="table-cap">Capacidad</label>
        <input
          id="table-cap"
          v-model.number="form.capacity"
          class="field-input"
          type="number"
          min="1"
          :max="TABLE_CAPACITY_MAX"
          step="1"
          required
          @input="clampCapacity"
        />
      </div>
      <div class="field">
        <label class="field-label" for="table-area">Área</label>
        <select id="table-area" v-model="form.areaId" class="field-input" required>
          <option value="" disabled>Seleccione un área</option>
          <option v-for="a in areas" :key="a.id" :value="a.id">{{ a.name }}</option>
        </select>
      </div>
    </ModalDialog>

    <ConfirmDialog
      v-if="confirmOpen"
      title="Eliminar mesa"
      message="¿Seguro que deseas eliminar esta mesa? Esta acción no se puede deshacer."
      :saving="deleting"
      :error="deleteError"
      @close="confirmOpen = false; deletingId = null"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped>
.tables-view {
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

/* Search */
.search-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f3f4f6;
  border-radius: 10px;
  padding: 9px 14px;
  max-width: 320px;
}

.search-icon {
  flex-shrink: 0;
  color: #9ca3af;
}

.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: 0.875rem;
  color: #1a1a1a;
  font-family: inherit;
}

.search-input::placeholder {
  color: #9ca3af;
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

.sort-header {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
}

.sort-header:hover {
  color: var(--color-primary);
}

.sort-header-right {
  flex-direction: row-reverse;
}

.sort-indicator {
  font-size: 0.7rem;
  color: var(--color-primary);
  min-width: 0.7rem;
}

.col-right {
  text-align: right;
}

.col-actions {
  text-align: right;
  width: 1%;
  white-space: nowrap;
}

.data-table tbody tr {
  height: 56px;
}

.data-row td {
  padding: 14px 12px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.9rem;
  vertical-align: middle;
}

.filler-row td {
  border-bottom: 1px solid #f3f4f6;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-row:hover td {
  background: #fafafa;
}

.table-name {
  font-weight: 600;
  color: #111827;
}

.col-muted {
  color: #6b7280;
}

.status-label {
  font-weight: 600;
}

.row-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.action-btn {
  padding: 5px 12px;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
}

.action-btn:hover {
  background: #e5e7eb;
}

.action-btn.danger {
  color: #dc2626;
}

.action-btn.danger:hover {
  background: #fee2e2;
}

.empty-row {
  text-align: center;
  color: #9ca3af;
  padding: 2.5rem 0;
}

.error-text {
  color: #dc2626;
}

/* Pagination */
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

/* Form fields */
.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.field-input {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.95rem;
  color: #111827;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
  background: white;
}

.field-input:focus {
  border-color: var(--color-primary);
}
</style>

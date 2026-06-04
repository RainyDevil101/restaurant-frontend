<script setup lang="ts">
import { reactive } from 'vue'
import { useAdminTables } from '../composables/useAdminTables'
import { useAdminDialog } from '../composables/useAdminDialog'
import { useAdminConfirm } from '../composables/useAdminConfirm'
import AdminPageHeader from '../components/AdminPageHeader.vue'
import AdminSearchBar from '../components/AdminSearchBar.vue'
import AdminPagination from '../components/AdminPagination.vue'
import AdminFormField from '../components/AdminFormField.vue'
import ModalDialog from '../components/ModalDialog.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
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
  createTable,
  updateTable,
  removeTable,
} = useAdminTables()

const STATUS_MAP = ADMIN_LABELS.table.statusLabels

const form = reactive({ name: '', capacity: 2, areaId: '' })
const {
  dialogOpen,
  editingId,
  saving,
  formError,
  openCreate: _openCreate,
  openEdit: _openEdit,
  runSave,
} = useAdminDialog()
const { confirmOpen, deleting, deleteError, openDelete, closeConfirm, runDelete } = useAdminConfirm()

function openCreate() {
  form.name = ''
  form.capacity = 2
  form.areaId = areas.value[0]?.id ?? ''
  _openCreate()
}

function openEdit(table: TableRow) {
  form.name = table.name
  form.capacity = table.capacity
  form.areaId = table.areaId
  _openEdit(table.id)
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
  const payload = { name: trimmedName, capacity: form.capacity, areaId: form.areaId }
  await runSave(async () => {
    if (editingId.value) await updateTable(editingId.value, payload)
    else await createTable(payload)
  })
}

async function confirmDelete() {
  await runDelete(removeTable)
}
</script>

<template>
  <div class="tables-view">
    <AdminPageHeader title="Mesas" new-label="Nueva mesa" @create="openCreate" />

    <AdminSearchBar v-model="search" placeholder="Buscar mesa..." />

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

    <AdminPagination
      v-model:page="page"
      v-model:pageSize="pageSize"
      :total-pages="totalPages"
      :page-size-options="PAGE_SIZE_OPTIONS"
    />

    <ModalDialog
      v-if="dialogOpen"
      :title="editingId ? 'Editar mesa' : 'Nueva mesa'"
      :saving="saving"
      :error="formError"
      @close="dialogOpen = false"
      @submit="save"
    >
      <AdminFormField label="Nombre" for="table-name">
        <input id="table-name" v-model="form.name" class="field-input" required />
      </AdminFormField>
      <AdminFormField label="Capacidad" for="table-cap">
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
      </AdminFormField>
      <AdminFormField label="Área" for="table-area">
        <select id="table-area" v-model="form.areaId" class="field-input" required>
          <option value="" disabled>Seleccione un área</option>
          <option v-for="a in areas" :key="a.id" :value="a.id">{{ a.name }}</option>
        </select>
      </AdminFormField>
    </ModalDialog>

    <ConfirmDialog
      v-if="confirmOpen"
      title="Eliminar mesa"
      message="¿Seguro que deseas eliminar esta mesa? Esta acción no se puede deshacer."
      :saving="deleting"
      :error="deleteError"
      @close="closeConfirm"
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
</style>

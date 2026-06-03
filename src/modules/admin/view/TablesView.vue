<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAdminTables } from '../composables/useAdminTables'
import ModalDialog from '../components/ModalDialog.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { ApiRequestError } from '@/shared/api/client'

const { tables, areas, search, loading, error, createTable, updateTable, removeTable } =
  useAdminTables()

const STATUS_MAP: Record<string, { color: string; label: string }> = {
  libre: { color: '#059669', label: 'Libre' },
  ocupada: { color: '#1D4ED8', label: 'Ocupada' },
  por_cobrar: { color: '#D97706', label: 'Por cobrar' },
}

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

function openEdit(table: { id: string; name: string; capacity: number; areaId: string }) {
  editingId.value = table.id
  form.name = table.name
  form.capacity = table.capacity
  form.areaId = table.areaId
  formError.value = ''
  dialogOpen.value = true
}

async function save() {
  saving.value = true
  formError.value = ''
  const payload = { name: form.name, capacity: form.capacity, areaId: form.areaId }
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
          <th>Mesa</th>
          <th>Área</th>
          <th class="col-right">Capacidad</th>
          <th class="col-right">Estado</th>
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

        <tr v-if="tables.length === 0">
          <td colspan="5" class="empty-row">
            <span v-if="loading">Cargando…</span>
            <span v-else-if="error" class="error-text">{{ error }}</span>
            <span v-else>Sin resultados</span>
          </td>
        </tr>
      </tbody>
    </table>

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
          required
        />
      </div>
      <div class="field">
        <label class="field-label" for="table-area">Área</label>
        <select id="table-area" v-model="form.areaId" class="field-input" required>
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
      @close="confirmOpen = false"
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

.col-right {
  text-align: right;
}

.col-actions {
  text-align: right;
  width: 1%;
  white-space: nowrap;
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

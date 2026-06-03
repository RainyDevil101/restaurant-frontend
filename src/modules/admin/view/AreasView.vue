<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAreas } from '../composables/useAreas'
import ModalDialog from '../components/ModalDialog.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { ApiRequestError } from '@/shared/api/client'

const { areas, loading, error, createArea, updateArea, removeArea } = useAreas()

const dialogOpen = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const formError = ref('')
const form = reactive({ name: '' })

function openCreate() {
  editingId.value = null
  form.name = ''
  formError.value = ''
  dialogOpen.value = true
}

function openEdit(area: { id: string; name: string }) {
  editingId.value = area.id
  form.name = area.name
  formError.value = ''
  dialogOpen.value = true
}

async function save() {
  saving.value = true
  formError.value = ''
  try {
    if (editingId.value) await updateArea(editingId.value, { name: form.name })
    else await createArea({ name: form.name })
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
    await removeArea(deletingId.value)
    confirmOpen.value = false
  } catch (err) {
    deleteError.value = err instanceof ApiRequestError ? err.message : 'No se pudo eliminar.'
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="areas-view">
    <div class="page-header">
      <h1 class="page-title">Áreas</h1>
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
        Nueva área
      </button>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>Nombre</th>
          <th class="col-right">Mesas</th>
          <th class="col-actions">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="area in areas" :key="area.id" class="data-row">
          <td>
            <span class="area-name">{{ area.name }}</span>
          </td>
          <td class="col-right">{{ area.tableCount }} mesas</td>
          <td class="col-actions">
            <div class="row-actions">
              <button class="action-btn" @click="openEdit(area)">Editar</button>
              <button class="action-btn danger" @click="openDelete(area.id)">Eliminar</button>
            </div>
          </td>
        </tr>

        <tr v-if="areas.length === 0">
          <td colspan="3" class="empty-row">
            <span v-if="loading">Cargando…</span>
            <span v-else-if="error" class="error-text">{{ error }}</span>
            <span v-else>Sin áreas registradas</span>
          </td>
        </tr>
      </tbody>
    </table>

    <ModalDialog
      v-if="dialogOpen"
      :title="editingId ? 'Editar área' : 'Nueva área'"
      :saving="saving"
      :error="formError"
      @close="dialogOpen = false"
      @submit="save"
    >
      <div class="field">
        <label class="field-label" for="area-name">Nombre</label>
        <input id="area-name" v-model="form.name" class="field-input" required />
      </div>
    </ModalDialog>

    <ConfirmDialog
      v-if="confirmOpen"
      title="Eliminar área"
      message="¿Seguro que deseas eliminar esta área? Esta acción no se puede deshacer."
      :saving="deleting"
      :error="deleteError"
      @close="confirmOpen = false"
      @confirm="confirmDelete"
    />
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

.area-name {
  font-weight: 600;
  color: #111827;
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
}

.field-input:focus {
  border-color: var(--color-primary);
}
</style>

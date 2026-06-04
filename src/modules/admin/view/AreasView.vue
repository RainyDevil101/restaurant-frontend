<script setup lang="ts">
import { reactive } from 'vue'
import { useAreas } from '../composables/useAreas'
import { useAdminDialog } from '../composables/useAdminDialog'
import { useAdminConfirm } from '../composables/useAdminConfirm'
import AdminPageHeader from '../components/AdminPageHeader.vue'
import AdminPagination from '../components/AdminPagination.vue'
import AdminFormField from '../components/AdminFormField.vue'
import ModalDialog from '../components/ModalDialog.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { ADMIN_LABELS, PAGE_SIZE_OPTIONS } from '../constants'

const {
  areas,
  loading,
  error,
  page,
  pageSize,
  totalPages,
  fillerCount,
  sortBy,
  sortDir,
  toggleSort,
  createArea,
  updateArea,
  removeArea,
} = useAreas()

const form = reactive({ name: '' })
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
  _openCreate()
}

function openEdit(area: { id: string; name: string }) {
  form.name = area.name
  _openEdit(area.id)
}

async function save() {
  const trimmedName = form.name.trim()
  if (!trimmedName) {
    formError.value = ADMIN_LABELS.area.nameRequired
    return
  }
  await runSave(async () => {
    if (editingId.value) await updateArea(editingId.value, { name: trimmedName })
    else await createArea({ name: trimmedName })
  })
}

async function confirmDelete() {
  await runDelete(removeArea)
}
</script>

<template>
  <div class="areas-view">
    <AdminPageHeader title="Áreas" new-label="Nueva área" @create="openCreate" />

    <table class="data-table">
      <thead>
        <tr>
          <th>
            <button type="button" class="sort-header" @click="toggleSort('name')">
              Nombre
              <span class="sort-indicator">{{ sortBy === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : '' }}</span>
            </button>
          </th>
          <th class="col-right">
            <button type="button" class="sort-header sort-header-right" @click="toggleSort('tableCount')">
              Mesas
              <span class="sort-indicator">{{ sortBy === 'tableCount' ? (sortDir === 'asc' ? '▲' : '▼') : '' }}</span>
            </button>
          </th>
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
              <button
                class="action-btn danger"
                :disabled="area.tableCount > 0"
                :title="area.tableCount > 0 ? ADMIN_LABELS.area.deleteBlockedTitle : undefined"
                @click="openDelete(area.id)"
              >Eliminar</button>
            </div>
          </td>
        </tr>

        <tr
          v-for="i in areas.length === 0 ? 0 : fillerCount"
          :key="'filler-' + i"
          class="filler-row"
          aria-hidden="true"
        >
          <td colspan="3"></td>
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

    <AdminPagination
      v-model:page="page"
      v-model:pageSize="pageSize"
      :total-pages="totalPages"
      :page-size-options="PAGE_SIZE_OPTIONS"
    />

    <ModalDialog
      v-if="dialogOpen"
      :title="editingId ? 'Editar área' : 'Nueva área'"
      :saving="saving"
      :error="formError"
      @close="dialogOpen = false"
      @submit="save"
    >
      <AdminFormField label="Nombre" for="area-name">
        <input id="area-name" v-model="form.name" class="field-input" required />
      </AdminFormField>
    </ModalDialog>

    <ConfirmDialog
      v-if="confirmOpen"
      title="Eliminar área"
      message="¿Seguro que deseas eliminar esta área? Esta acción no se puede deshacer."
      :saving="deleting"
      :error="deleteError"
      @close="closeConfirm"
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

.action-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
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

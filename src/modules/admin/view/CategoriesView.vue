<script setup lang="ts">
import { reactive } from 'vue'
import { useCategories } from '../composables/useCategories'
import { useAdminDialog } from '../composables/useAdminDialog'
import { useAdminConfirm } from '../composables/useAdminConfirm'
import AdminPageHeader from '../components/AdminPageHeader.vue'
import AdminSearchBar from '../components/AdminSearchBar.vue'
import AdminPagination from '../components/AdminPagination.vue'
import AdminFormField from '../components/AdminFormField.vue'
import ModalDialog from '../components/ModalDialog.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { ADMIN_LABELS, PAGE_SIZE_OPTIONS } from '../constants'

const {
  categories,
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
  createCategory,
  updateCategory,
  removeCategory,
} = useCategories()

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

function openEdit(category: { id: string; name: string }) {
  form.name = category.name
  _openEdit(category.id)
}

async function save() {
  const trimmedName = form.name.trim()
  if (!trimmedName) {
    formError.value = ADMIN_LABELS.category.nameRequired
    return
  }
  await runSave(async () => {
    if (editingId.value) await updateCategory(editingId.value, { name: trimmedName })
    else await createCategory({ name: trimmedName })
  })
}

async function confirmDelete() {
  await runDelete(removeCategory)
}
</script>

<template>
  <div class="categories-view">
    <AdminPageHeader title="Categorías" new-label="Nueva categoría" @create="openCreate" />

    <AdminSearchBar v-model="search" placeholder="Buscar categoría..." />

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
            <button type="button" class="sort-header sort-header-right" @click="toggleSort('productCount')">
              Productos
              <span class="sort-indicator">{{ sortBy === 'productCount' ? (sortDir === 'asc' ? '▲' : '▼') : '' }}</span>
            </button>
          </th>
          <th class="col-actions">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="category in categories" :key="category.id" class="data-row">
          <td>
            <span class="category-name">{{ category.name }}</span>
          </td>
          <td class="col-right">{{ category.productCount }} productos</td>
          <td class="col-actions">
            <div class="row-actions">
              <button class="action-btn" @click="openEdit(category)">Editar</button>
              <button
                class="action-btn danger"
                :disabled="category.productCount > 0"
                :title="category.productCount > 0 ? ADMIN_LABELS.category.deleteBlockedTitle : undefined"
                @click="openDelete(category.id)"
              >
                Eliminar
              </button>
            </div>
          </td>
        </tr>

        <tr
          v-for="i in categories.length === 0 ? 0 : fillerCount"
          :key="'filler-' + i"
          class="filler-row"
          aria-hidden="true"
        >
          <td colspan="3"></td>
        </tr>

        <tr v-if="categories.length === 0">
          <td colspan="3" class="empty-row">
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
      :title="editingId ? 'Editar categoría' : 'Nueva categoría'"
      :saving="saving"
      :error="formError"
      @close="dialogOpen = false"
      @submit="save"
    >
      <AdminFormField label="Nombre" for="cat-name">
        <input id="cat-name" v-model="form.name" class="field-input" required />
      </AdminFormField>
    </ModalDialog>

    <ConfirmDialog
      v-if="confirmOpen"
      title="Eliminar categoría"
      message="¿Seguro que deseas eliminar esta categoría? Esta acción no se puede deshacer."
      :saving="deleting"
      :error="deleteError"
      @close="closeConfirm"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped>
.categories-view {
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

.category-name {
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

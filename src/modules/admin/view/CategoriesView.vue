<script setup lang="ts">
import { computed, reactive } from 'vue'
import { colors } from '@/shared/styles/colors'
import { useCategories, type CategoryRow } from '../composables/useCategories'
import { useAdminDialog } from '../composables/useAdminDialog'
import { useAdminConfirm } from '../composables/useAdminConfirm'
import AdminPageHeader from '../components/AdminPageHeader.vue'
import AdminFormField from '../components/AdminFormField.vue'
import ModalDialog from '../components/ModalDialog.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import DataTable, { type Column } from '@/shared/components/DataTable.vue'
import { ADMIN_LABELS, PRODUCTS_PER_PAGE, PAGE_SIZE_OPTIONS } from '../constants'

const { categories, areas, loading, error, createCategory, updateCategory, removeCategory } =
  useCategories()

const columns = computed<Column<CategoryRow>[]>(() => [
  { key: 'name', label: 'Categoría', sortable: true },
  {
    key: 'areaName',
    label: 'Área',
    sortable: true,
    filter: {
      type: 'select',
      options: areas.value.map((area) => ({ value: area.name, label: area.name })),
    },
  },
  { key: 'productCount', label: 'Productos', sortable: true, align: 'right' },
  { key: 'actions', label: 'Acciones', align: 'right' },
])

const form = reactive({ name: '', areaId: '' })
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
  form.areaId = ''
  _openCreate()
}

function openEdit(category: CategoryRow) {
  form.name = category.name
  form.areaId = category.areaId ?? ''
  _openEdit(category.id)
}

async function save() {
  const trimmedName = form.name.trim()
  if (!trimmedName) {
    formError.value = ADMIN_LABELS.category.nameRequired
    return
  }
  if (!form.areaId) {
    formError.value = ADMIN_LABELS.category.areaRequired
    return
  }
  const payload = { name: trimmedName, areaId: form.areaId }
  await runSave(async () => {
    if (editingId.value) await updateCategory(editingId.value, payload)
    else await createCategory(payload)
  })
}

async function confirmDelete() {
  await runDelete(removeCategory)
}
</script>

<template>
  <div class="categories-view">
    <AdminPageHeader title="Categorías" new-label="Nueva categoría" @create="openCreate" />

    <DataTable
      :items="categories"
      :columns="columns"
      :loading="loading"
      :error="error"
      :page-size="PRODUCTS_PER_PAGE"
      :page-size-options="PAGE_SIZE_OPTIONS"
      default-sort="name"
      search-placeholder="Buscar categoría..."
    >
      <template #cell-name="{ row }">
        <span class="category-name">{{ row.name }}</span>
      </template>

      <template #cell-areaName="{ row }">
        <span class="col-muted">{{ row.areaName }}</span>
      </template>

      <template #cell-productCount="{ row }">{{ row.productCount }} productos</template>

      <template #cell-actions="{ row }">
        <div class="row-actions">
          <button class="action-btn" @click="openEdit(row)">Editar</button>
          <button
            class="action-btn danger"
            :disabled="row.productCount > 0"
            :title="row.productCount > 0 ? ADMIN_LABELS.category.deleteBlockedTitle : undefined"
            @click="openDelete(row.id)"
          >
            Eliminar
          </button>
        </div>
      </template>
    </DataTable>

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
      <AdminFormField label="Área" for="cat-area">
        <select id="cat-area" v-model="form.areaId" class="field-input" required>
          <option value="" disabled>Seleccione un área</option>
          <option v-for="a in areas" :key="a.id" :value="a.id">{{ a.name }}</option>
        </select>
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

.category-name {
  font-weight: 600;
  color: #111827;
}

.col-muted {
  color: v-bind('colors.neutral.secondary');
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
</style>

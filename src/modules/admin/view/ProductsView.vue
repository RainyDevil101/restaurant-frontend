<script setup lang="ts">
import { computed } from 'vue'
import { useProducts, type ProductRow } from '../composables/useProducts'
import { useProductForm } from '../composables/useProductForm'
import { useAvailabilityToggle } from '../composables/useAvailabilityToggle'
import { useAdminConfirm } from '../composables/useAdminConfirm'
import AdminPageHeader from '../components/AdminPageHeader.vue'
import ProductFormDialog from '../components/ProductFormDialog.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import DataTable, { type Column } from '@/shared/components/DataTable.vue'
import { formatCurrency } from '../helpers/formatCurrency'
import { PRODUCTS_PER_PAGE, PAGE_SIZE_OPTIONS } from '../constants'

const {
  products,
  categories,
  loading,
  error,
  createProduct,
  updateProduct,
  removeProduct,
  toggleAvailability,
  createCategory,
} = useProducts()

const { toggle, actionError } = useAvailabilityToggle(toggleAvailability)
const {
  dialogOpen,
  editingId,
  saving,
  formError,
  closeDialog,
  form,
  inlineCat,
  clampPrice,
  openCreate,
  openEdit,
  save,
} = useProductForm({ categories, createProduct, updateProduct, createCategory })
const { confirmOpen, deleting, deleteError, openDelete, closeConfirm, runDelete } = useAdminConfirm()

const columns = computed<Column<ProductRow>[]>(() => [
  { key: 'name', label: 'Producto', sortable: true },
  {
    key: 'categoryName',
    label: 'Categoría',
    sortable: true,
    filter: {
      type: 'select',
      options: categories.value.map((category) => ({ value: category.name, label: category.name })),
    },
  },
  { key: 'price', label: 'Precio', sortable: true, align: 'right' },
  {
    key: 'available',
    label: 'Estado',
    align: 'right',
    accessor: (product) => String(product.available),
    filter: {
      type: 'select',
      options: [
        { value: 'true', label: 'Disponible' },
        { value: 'false', label: 'Agotado' },
      ],
    },
  },
  { key: 'actions', label: 'Acciones', align: 'right' },
])

function patchForm(patch: Partial<typeof form>) {
  Object.assign(form, patch)
}

async function confirmDelete() {
  await runDelete(removeProduct)
}
</script>

<template>
  <div class="products-view">
    <AdminPageHeader title="Productos" new-label="Nuevo producto" @create="openCreate" />

    <p v-if="actionError" class="action-error" role="alert">{{ actionError }}</p>

    <DataTable
      :items="products"
      :columns="columns"
      :loading="loading"
      :error="error"
      :page-size="PRODUCTS_PER_PAGE"
      :page-size-options="PAGE_SIZE_OPTIONS"
      default-sort="name"
      search-placeholder="Buscar producto..."
    >
      <template #cell-price="{ row }">{{ formatCurrency(row.price) }}</template>

      <template #cell-available="{ row }">
        <button
          type="button"
          class="status-toggle"
          :class="row.available ? 'status-available' : 'status-unavailable'"
          @click="toggle(row.id)"
        >
          {{ row.available ? 'Disponible' : 'Agotado' }}
        </button>
      </template>

      <template #cell-actions="{ row }">
        <div class="row-actions">
          <button class="action-btn" @click="openEdit(row)">Editar</button>
          <button class="action-btn danger" @click="openDelete(row.id)">Eliminar</button>
        </div>
      </template>
    </DataTable>

    <ProductFormDialog
      :open="dialogOpen"
      :editing-id="editingId"
      :saving="saving"
      :error="formError"
      :form="form"
      :categories="categories"
      :inline-cat="inlineCat"
      @close="closeDialog"
      @submit="save"
      @clamp-price="clampPrice"
      @update:form="patchForm"
      @update:inline-cat-input="(v) => (inlineCat.inputName.value = v)"
    />

    <ConfirmDialog
      v-if="confirmOpen"
      title="Eliminar producto"
      message="¿Seguro que deseas eliminar este producto? Esta acción no se puede deshacer."
      :saving="deleting"
      :error="deleteError"
      @close="closeConfirm"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped>
.products-view {
  padding: 1.75rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.action-error {
  font-size: 0.85rem;
  color: #dc2626;
}

.status-toggle {
  background: none;
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.status-available {
  color: #059669;
}

.status-unavailable {
  color: #9ca3af;
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
</style>

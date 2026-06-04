<script setup lang="ts">
import { useProducts } from '../composables/useProducts'
import { useProductForm } from '../composables/useProductForm'
import { useAvailabilityToggle } from '../composables/useAvailabilityToggle'
import { useAdminConfirm } from '../composables/useAdminConfirm'
import AdminPageHeader from '../components/AdminPageHeader.vue'
import AdminSearchBar from '../components/AdminSearchBar.vue'
import AdminPagination from '../components/AdminPagination.vue'
import ProductFormDialog from '../components/ProductFormDialog.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { formatCurrency } from '../helpers/formatCurrency'
import { PAGE_SIZE_OPTIONS } from '../constants'

const {
  products,
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

    <AdminSearchBar v-model="search" placeholder="Buscar producto..." />

    <p v-if="actionError" class="action-error" role="alert">{{ actionError }}</p>

    <table class="data-table">
      <thead>
        <tr>
          <th>
            <button type="button" class="sort-header" @click="toggleSort('name')">
              Producto
              <span class="sort-indicator">{{
                sortBy === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : ''
              }}</span>
            </button>
          </th>
          <th>
            <button type="button" class="sort-header" @click="toggleSort('categoryName')">
              Categoría
              <span class="sort-indicator">{{
                sortBy === 'categoryName' ? (sortDir === 'asc' ? '▲' : '▼') : ''
              }}</span>
            </button>
          </th>
          <th class="col-right">
            <button type="button" class="sort-header sort-header-right" @click="toggleSort('price')">
              Precio
              <span class="sort-indicator">{{
                sortBy === 'price' ? (sortDir === 'asc' ? '▲' : '▼') : ''
              }}</span>
            </button>
          </th>
          <th class="col-right">Estado</th>
          <th class="col-actions">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.id" class="data-row">
          <td class="col-product">
            <span class="product-name">{{ product.name }}</span>
          </td>
          <td class="col-muted">{{ product.categoryName }}</td>
          <td class="col-right">{{ formatCurrency(product.price) }}</td>
          <td class="col-right">
            <button
              type="button"
              class="status-toggle"
              :class="product.available ? 'status-available' : 'status-unavailable'"
              @click="toggle(product.id)"
            >
              {{ product.available ? 'Disponible' : 'Agotado' }}
            </button>
          </td>
          <td class="col-actions">
            <div class="row-actions">
              <button class="action-btn" @click="openEdit(product)">Editar</button>
              <button class="action-btn danger" @click="openDelete(product.id)">Eliminar</button>
            </div>
          </td>
        </tr>

        <tr
          v-for="i in products.length === 0 ? 0 : fillerCount"
          :key="'filler-' + i"
          class="filler-row"
          aria-hidden="true"
        >
          <td colspan="5"></td>
        </tr>

        <tr v-if="products.length === 0">
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

.product-name {
  font-weight: 600;
  color: #111827;
}

.col-muted {
  color: #6b7280;
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

.empty-row {
  text-align: center;
  color: #9ca3af;
  padding: 2.5rem 0;
}

.error-text {
  color: #dc2626;
}
</style>

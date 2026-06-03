<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useProducts } from '../composables/useProducts'
import { areaLabel } from '../helpers/areaLabel'
import { formatCurrency } from '../helpers/formatCurrency'
import ModalDialog from '../components/ModalDialog.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { ApiRequestError } from '@/shared/api/client'

const {
  products,
  categories,
  search,
  loading,
  error,
  createProduct,
  updateProduct,
  removeProduct,
  toggleAvailability,
} = useProducts()

const actionError = ref('')

async function toggle(id: string) {
  actionError.value = ''
  try {
    await toggleAvailability(id)
  } catch (err) {
    actionError.value = err instanceof ApiRequestError ? err.message : 'No se pudo actualizar.'
  }
}

const dialogOpen = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const formError = ref('')
const form = reactive({ name: '', description: '', price: 0, categoryId: '' })

function openCreate() {
  editingId.value = null
  form.name = ''
  form.description = ''
  form.price = 0
  form.categoryId = categories.value[0]?.id ?? ''
  formError.value = ''
  dialogOpen.value = true
}

function openEdit(product: {
  id: string
  name: string
  description?: string
  price: number
  categoryId: string
}) {
  editingId.value = product.id
  form.name = product.name
  form.description = product.description ?? ''
  form.price = product.price
  form.categoryId = product.categoryId
  formError.value = ''
  dialogOpen.value = true
}

async function save() {
  saving.value = true
  formError.value = ''
  const payload = {
    name: form.name,
    description: form.description.trim() || undefined,
    price: form.price,
    categoryId: form.categoryId,
  }
  try {
    if (editingId.value) await updateProduct(editingId.value, payload)
    else await createProduct(payload)
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
    await removeProduct(deletingId.value)
    confirmOpen.value = false
  } catch (err) {
    deleteError.value = err instanceof ApiRequestError ? err.message : 'No se pudo eliminar.'
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="products-view">
    <div class="page-header">
      <h1 class="page-title">Productos</h1>
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
        Nuevo producto
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
      <input v-model="search" class="search-input" placeholder="Buscar producto..." />
    </div>

    <p v-if="actionError" class="action-error" role="alert">{{ actionError }}</p>

    <table class="data-table">
      <thead>
        <tr>
          <th>Producto</th>
          <th>Categoría</th>
          <th>Área</th>
          <th class="col-right">Precio</th>
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
          <td>
            <span
              class="area-tag"
              :style="{
                background: areaLabel(product.categoryId).bg,
                color: areaLabel(product.categoryId).color,
              }"
            >
              {{ areaLabel(product.categoryId).text }}
            </span>
          </td>
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

        <tr v-if="products.length === 0">
          <td colspan="6" class="empty-row">
            <span v-if="loading">Cargando…</span>
            <span v-else-if="error" class="error-text">{{ error }}</span>
            <span v-else>Sin resultados</span>
          </td>
        </tr>
      </tbody>
    </table>

    <ModalDialog
      v-if="dialogOpen"
      :title="editingId ? 'Editar producto' : 'Nuevo producto'"
      :saving="saving"
      :error="formError"
      @close="dialogOpen = false"
      @submit="save"
    >
      <div class="field">
        <label class="field-label" for="prod-name">Nombre</label>
        <input id="prod-name" v-model="form.name" class="field-input" required />
      </div>
      <div class="field">
        <label class="field-label" for="prod-desc">Descripción</label>
        <input id="prod-desc" v-model="form.description" class="field-input" />
      </div>
      <div class="field">
        <label class="field-label" for="prod-price">Precio</label>
        <input
          id="prod-price"
          v-model.number="form.price"
          class="field-input"
          type="number"
          min="0"
          step="0.01"
          required
        />
      </div>
      <div class="field">
        <label class="field-label" for="prod-cat">Categoría</label>
        <select id="prod-cat" v-model="form.categoryId" class="field-input" required>
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>
    </ModalDialog>

    <ConfirmDialog
      v-if="confirmOpen"
      title="Eliminar producto"
      message="¿Seguro que deseas eliminar este producto? Esta acción no se puede deshacer."
      :saving="deleting"
      :error="deleteError"
      @close="confirmOpen = false"
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

.product-name {
  font-weight: 600;
  color: #111827;
}

.col-muted {
  color: #6b7280;
}

.area-tag {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
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

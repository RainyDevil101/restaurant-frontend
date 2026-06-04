<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useMenus } from '../composables/useMenus'
import { formatCurrency } from '../helpers/formatCurrency'
import ModalDialog from '../components/ModalDialog.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { ApiRequestError } from '@/shared/api/client'
import { ADMIN_LABELS, PAGE_SIZE_OPTIONS, PRODUCT_PRICE_MAX } from '../constants'

const {
  menus,
  products,
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
  createMenu,
  updateMenu,
  removeMenu,
  toggleActive,
} = useMenus()

const actionError = ref('')

async function toggle(id: string) {
  actionError.value = ''
  try {
    await toggleActive(id)
  } catch (err) {
    actionError.value = err instanceof ApiRequestError ? err.message : 'No se pudo actualizar.'
  }
}

const dialogOpen = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const formError = ref('')
const form = reactive<{ name: string; productIds: string[]; price: number }>({
  name: '',
  productIds: [],
  price: 0,
})

function clampPrice() {
  form.price = Math.round(form.price)
  if (form.price > PRODUCT_PRICE_MAX) form.price = PRODUCT_PRICE_MAX
  if (form.price < 0) form.price = 0
}

function openCreate() {
  editingId.value = null
  form.name = ''
  form.productIds = []
  form.price = 0
  formError.value = ''
  dialogOpen.value = true
}

function openEdit(menu: { id: string; name: string; productIds: string[]; price: number }) {
  editingId.value = menu.id
  form.name = menu.name
  form.productIds = [...menu.productIds]
  form.price = menu.price
  formError.value = ''
  dialogOpen.value = true
}

async function save() {
  const trimmedName = form.name.trim()
  if (!trimmedName) {
    formError.value = ADMIN_LABELS.menu.nameRequired
    return
  }
  if (form.productIds.length === 0) {
    formError.value = ADMIN_LABELS.menu.productsRequired
    return
  }
  if (!Number.isInteger(form.price) || form.price < 0 || form.price > PRODUCT_PRICE_MAX) {
    formError.value = ADMIN_LABELS.menu.priceInvalid
    return
  }
  saving.value = true
  formError.value = ''
  const payload = { name: trimmedName, productIds: form.productIds, price: form.price }
  try {
    if (editingId.value) await updateMenu(editingId.value, payload)
    else await createMenu(payload)
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
    await removeMenu(deletingId.value)
    confirmOpen.value = false
  } catch (err) {
    deleteError.value = err instanceof ApiRequestError ? err.message : 'No se pudo eliminar.'
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="menus-view">
    <div class="page-header">
      <h1 class="page-title">Menús</h1>
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
        Nuevo menú
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
      <input v-model="search" class="search-input" placeholder="Buscar menú..." />
    </div>

    <p v-if="actionError" class="action-error" role="alert">{{ actionError }}</p>

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
          <th class="col-right">
            <button type="button" class="sort-header sort-header-right" @click="toggleSort('price')">
              Precio
              <span class="sort-indicator">{{ sortBy === 'price' ? (sortDir === 'asc' ? '▲' : '▼') : '' }}</span>
            </button>
          </th>
          <th class="col-right">
            <button type="button" class="sort-header sort-header-right" @click="toggleSort('active')">
              Estado
              <span class="sort-indicator">{{ sortBy === 'active' ? (sortDir === 'asc' ? '▲' : '▼') : '' }}</span>
            </button>
          </th>
          <th class="col-actions">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="menu in menus" :key="menu.id" class="data-row">
          <td>
            <span class="menu-name">{{ menu.name }}</span>
          </td>
          <td class="col-right">{{ menu.productCount }} productos</td>
          <td class="col-right">{{ formatCurrency(menu.price) }}</td>
          <td class="col-right">
            <button
              type="button"
              class="status-toggle"
              :class="menu.active ? 'status-active' : 'status-inactive'"
              @click="toggle(menu.id)"
            >
              {{ menu.active ? 'Activo' : 'Inactivo' }}
            </button>
          </td>
          <td class="col-actions">
            <div class="row-actions">
              <button class="action-btn" @click="openEdit(menu)">Editar</button>
              <button class="action-btn danger" @click="openDelete(menu.id)">Eliminar</button>
            </div>
          </td>
        </tr>

        <tr
          v-for="i in menus.length === 0 ? 0 : fillerCount"
          :key="'filler-' + i"
          class="filler-row"
          aria-hidden="true"
        >
          <td colspan="5"></td>
        </tr>

        <tr v-if="menus.length === 0">
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
      :title="editingId ? 'Editar menú' : 'Nuevo menú'"
      :saving="saving"
      :error="formError"
      @close="dialogOpen = false"
      @submit="save"
    >
      <div class="field">
        <label class="field-label" for="menu-name">Nombre</label>
        <input id="menu-name" v-model="form.name" class="field-input" required />
      </div>
      <div class="field">
        <label class="field-label" for="menu-price">Precio</label>
        <input
          id="menu-price"
          v-model.number="form.price"
          class="field-input"
          type="number"
          min="0"
          :max="PRODUCT_PRICE_MAX"
          step="1"
          required
          @input="clampPrice"
        />
      </div>
      <div class="field">
        <span class="field-label">Productos ({{ form.productIds.length }})</span>
        <div class="product-picker">
          <label v-for="p in products" :key="p.id" class="picker-row">
            <input v-model="form.productIds" type="checkbox" :value="p.id" />
            <span>{{ p.name }}</span>
          </label>
          <p v-if="products.length === 0" class="picker-empty">No hay productos.</p>
        </div>
      </div>
    </ModalDialog>

    <ConfirmDialog
      v-if="confirmOpen"
      title="Eliminar menú"
      message="¿Seguro que deseas eliminar este menú? Esta acción no se puede deshacer."
      :saving="deleting"
      :error="deleteError"
      @close="confirmOpen = false; deletingId = null"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped>
.menus-view {
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

.menu-name {
  font-weight: 600;
  color: #111827;
}

.status-toggle {
  background: none;
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.status-active {
  color: #059669;
}

.status-inactive {
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
}

.field-input:focus {
  border-color: var(--color-primary);
}

.product-picker {
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  max-height: 220px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.picker-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  font-size: 0.9rem;
  color: #374151;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
}

.picker-row:last-child {
  border-bottom: none;
}

.picker-row:hover {
  background: #fafafa;
}

.picker-empty {
  padding: 1rem 12px;
  font-size: 0.85rem;
  color: #9ca3af;
}
</style>

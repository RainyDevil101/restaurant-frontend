<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useMenus } from '../composables/useMenus'
import { useAdminDialog } from '../composables/useAdminDialog'
import { useAdminConfirm } from '../composables/useAdminConfirm'
import { formatCurrency } from '../helpers/formatCurrency'
import AdminPageHeader from '../components/AdminPageHeader.vue'
import AdminSearchBar from '../components/AdminSearchBar.vue'
import AdminPagination from '../components/AdminPagination.vue'
import AdminFormField from '../components/AdminFormField.vue'
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

const form = reactive<{ name: string; productIds: string[]; price: number }>({
  name: '',
  productIds: [],
  price: 0,
})
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

function clampPrice() {
  form.price = Math.round(form.price)
  if (form.price > PRODUCT_PRICE_MAX) form.price = PRODUCT_PRICE_MAX
  if (form.price < 0) form.price = 0
}

function openCreate() {
  form.name = ''
  form.productIds = []
  form.price = 0
  _openCreate()
}

function openEdit(menu: { id: string; name: string; productIds: string[]; price: number }) {
  form.name = menu.name
  form.productIds = [...menu.productIds]
  form.price = menu.price
  _openEdit(menu.id)
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
  const payload = { name: trimmedName, productIds: form.productIds, price: form.price }
  await runSave(async () => {
    if (editingId.value) await updateMenu(editingId.value, payload)
    else await createMenu(payload)
  })
}

async function confirmDelete() {
  await runDelete(removeMenu)
}
</script>

<template>
  <div class="menus-view">
    <AdminPageHeader title="Menús" new-label="Nuevo menú" @create="openCreate" />

    <AdminSearchBar v-model="search" placeholder="Buscar menú..." />

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

    <AdminPagination
      v-model:page="page"
      v-model:pageSize="pageSize"
      :total-pages="totalPages"
      :page-size-options="PAGE_SIZE_OPTIONS"
    />

    <ModalDialog
      v-if="dialogOpen"
      :title="editingId ? 'Editar menú' : 'Nuevo menú'"
      :saving="saving"
      :error="formError"
      @close="dialogOpen = false"
      @submit="save"
    >
      <AdminFormField label="Nombre" for="menu-name">
        <input id="menu-name" v-model="form.name" class="field-input" required />
      </AdminFormField>
      <AdminFormField label="Precio" for="menu-price">
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
      </AdminFormField>
      <AdminFormField :label="`Productos (${form.productIds.length})`" for="menu-products">
        <div id="menu-products" class="product-picker">
          <label v-for="p in products" :key="p.id" class="picker-row">
            <input v-model="form.productIds" type="checkbox" :value="p.id" />
            <span>{{ p.name }}</span>
          </label>
          <p v-if="products.length === 0" class="picker-empty">No hay productos.</p>
        </div>
      </AdminFormField>
    </ModalDialog>

    <ConfirmDialog
      v-if="confirmOpen"
      title="Eliminar menú"
      message="¿Seguro que deseas eliminar este menú? Esta acción no se puede deshacer."
      :saving="deleting"
      :error="deleteError"
      @close="closeConfirm"
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

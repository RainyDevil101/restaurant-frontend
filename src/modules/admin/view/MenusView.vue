<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import { colors } from '@/shared/styles/colors'
import { useMenus, type MenuRow } from '../composables/useMenus'
import { useAdminDialog } from '../composables/useAdminDialog'
import { useAdminConfirm } from '../composables/useAdminConfirm'
import { formatCurrency } from '../helpers/formatCurrency'
import AdminPageHeader from '../components/AdminPageHeader.vue'
import AdminFormField from '../components/AdminFormField.vue'
import ModalDialog from '../components/ModalDialog.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import DataTable, { type Column } from '@/shared/components/DataTable.vue'
import { ApiRequestError } from '@/shared/api/client'
import type { MenuItem } from '@/shared/types'
import {
  ADMIN_LABELS,
  PRODUCTS_PER_PAGE,
  PAGE_SIZE_OPTIONS,
  PRODUCT_PRICE_MAX,
} from '../constants'

const { menus, products, loading, error, createMenu, updateMenu, removeMenu, toggleActive } =
  useMenus()

const columns = computed<Column<MenuRow>[]>(() => [
  { key: 'name', label: 'Menú', sortable: true },
  { key: 'productCount', label: 'Productos', sortable: true, align: 'right' },
  { key: 'price', label: 'Precio', sortable: true, align: 'right' },
  {
    key: 'active',
    label: 'Estado',
    align: 'right',
    sortable: true,
    accessor: (menu) => String(menu.active),
    filter: {
      type: 'select',
      options: [
        { value: 'true', label: 'Activo' },
        { value: 'false', label: 'Inactivo' },
      ],
    },
  },
  { key: 'actions', label: 'Acciones', align: 'right' },
])

const actionError = ref('')

async function toggle(id: string) {
  actionError.value = ''
  try {
    await toggleActive(id)
  } catch (err) {
    actionError.value = err instanceof ApiRequestError ? err.message : 'No se pudo actualizar.'
  }
}

const form = reactive<{ name: string; items: MenuItem[]; price: number }>({
  name: '',
  items: [],
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
  form.items = []
  form.price = 0
  _openCreate()
}

function openEdit(menu: MenuRow) {
  form.name = menu.name
  form.items = menu.items.map((i) => ({ ...i }))
  form.price = menu.price
  _openEdit(menu.id)
}

function isSelected(productId: string) {
  return form.items.some((i) => i.productId === productId)
}

function toggleProduct(productId: string) {
  const index = form.items.findIndex((i) => i.productId === productId)
  if (index === -1) form.items.push({ productId, quantity: 1 })
  else form.items.splice(index, 1)
}

function setQuantity(productId: string, quantity: number) {
  const item = form.items.find((i) => i.productId === productId)
  if (!item) return
  const next = Math.max(1, Math.floor(quantity))
  item.quantity = Number.isNaN(next) ? 1 : next
}

async function save() {
  const trimmedName = form.name.trim()
  if (!trimmedName) {
    formError.value = ADMIN_LABELS.menu.nameRequired
    return
  }
  if (form.items.length === 0) {
    formError.value = ADMIN_LABELS.menu.productsRequired
    return
  }
  if (!Number.isInteger(form.price) || form.price < 0 || form.price > PRODUCT_PRICE_MAX) {
    formError.value = ADMIN_LABELS.menu.priceInvalid
    return
  }
  const payload = { name: trimmedName, items: form.items, price: form.price }
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

    <p v-if="actionError" class="action-error" role="alert">{{ actionError }}</p>

    <DataTable
      :items="menus"
      :columns="columns"
      :loading="loading"
      :error="error"
      :page-size="PRODUCTS_PER_PAGE"
      :page-size-options="PAGE_SIZE_OPTIONS"
      default-sort="name"
      search-placeholder="Buscar menú..."
    >
      <template #cell-name="{ row }">
        <span class="menu-name">{{ row.name }}</span>
      </template>

      <template #cell-productCount="{ row }">{{ row.productCount }} productos</template>

      <template #cell-price="{ row }">{{ formatCurrency(row.price) }}</template>

      <template #cell-active="{ row }">
        <button
          type="button"
          class="status-toggle"
          :class="row.active ? 'status-active' : 'status-inactive'"
          @click="toggle(row.id)"
        >
          {{ row.active ? 'Activo' : 'Inactivo' }}
        </button>
      </template>

      <template #cell-actions="{ row }">
        <div class="row-actions">
          <button class="action-btn" @click="openEdit(row)">Editar</button>
          <button class="action-btn danger" @click="openDelete(row.id)">Eliminar</button>
        </div>
      </template>
    </DataTable>

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
      <AdminFormField :label="`Productos (${form.items.length})`" for="menu-products">
        <div id="menu-products" class="product-picker">
          <div v-for="p in products" :key="p.id" class="picker-row">
            <label class="picker-label">
              <input
                type="checkbox"
                :checked="isSelected(p.id)"
                @change="toggleProduct(p.id)"
              />
              <span>{{ p.name }}</span>
            </label>
            <input
              v-if="isSelected(p.id)"
              class="picker-qty"
              type="number"
              min="1"
              step="1"
              :value="form.items.find((i) => i.productId === p.id)?.quantity"
              :aria-label="`Cantidad de ${p.name}`"
              @input="setQuantity(p.id, Number(($event.target as HTMLInputElement).value))"
            />
          </div>
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
  color: v-bind('colors.feedback.error');
}

.menu-name {
  font-weight: 600;
  color: v-bind('colors.neutral.textStrong');
}

.status-toggle {
  background: none;
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  padding: 0.25rem 0;
  min-height: 2rem;
  line-height: 1.5;
}

.status-toggle:focus-visible {
  outline: 2px solid v-bind('colors.brand.primary');
  outline-offset: 2px;
  border-radius: 4px;
}

.status-active {
  color: v-bind('colors.feedback.success');
}

.status-inactive {
  color: v-bind('colors.neutral.muted');
}

.row-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.action-btn {
  padding: 5px 12px;
  background: v-bind('colors.neutral.borderSubtle');
  color: v-bind('colors.neutral.textMedium');
  border: none;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
}

.action-btn:hover {
  background: v-bind('colors.neutral.border');
}

.action-btn:focus-visible {
  outline: 2px solid v-bind('colors.brand.primary');
  outline-offset: 2px;
}

.action-btn.danger {
  color: v-bind('colors.feedback.error');
}

.action-btn.danger:hover {
  background: v-bind('colors.feedback.errorBg');
}

.product-picker {
  border: 1.5px solid v-bind('colors.neutral.border');
  border-radius: 10px;
  max-height: 220px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.picker-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 9px 12px;
  font-size: 0.9rem;
  color: v-bind('colors.neutral.textMedium');
  border-bottom: 1px solid v-bind('colors.neutral.borderSubtle');
}

.picker-row:last-child {
  border-bottom: none;
}

.picker-row:hover {
  background: v-bind('colors.neutral.surface');
}

.picker-label {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.picker-qty {
  flex-shrink: 0;
  width: 64px;
  padding: 5px 8px;
  font-size: 0.88rem;
  color: v-bind('colors.neutral.textStrong');
  border: 1.5px solid v-bind('colors.neutral.border');
  border-radius: 8px;
  background: v-bind('colors.neutral.background');
  text-align: right;
}

.picker-qty:focus-visible {
  outline: 2px solid v-bind('colors.brand.primary');
  outline-offset: 1px;
  border-color: v-bind('colors.brand.primary');
}

.picker-empty {
  padding: 1rem 12px;
  font-size: 0.85rem;
  color: v-bind('colors.neutral.muted');
}
</style>

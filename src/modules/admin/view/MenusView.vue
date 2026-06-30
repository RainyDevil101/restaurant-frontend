<script setup lang="ts">
import { colors } from '@/shared/styles/colors';
import { useMenus } from '../composables/useMenus';
import type { MenuRow } from '../domain';
import { useMenuForm } from '../composables/useMenuForm';
import { useAdminConfirm } from '../composables/useAdminConfirm';
import { useAvailabilityToggle } from '../composables/useAvailabilityToggle';
import { formatCurrency } from '../helpers/formatCurrency';
import AdminPageHeader from '../components/AdminPageHeader.vue';
import MenuFormDialog from '../components/MenuFormDialog.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import DataTable, { type Column } from '@/shared/components/DataTable.vue';
import { ADMIN_LABELS, PRODUCTS_PER_PAGE, PAGE_SIZE_OPTIONS } from '../constants';
import { ROUTE_TITLES } from '@/shared/constants/brand';
import { UI_LABELS } from '@/shared/constants/ui';

const { menus, products, loading, error, createMenu, updateMenu, removeMenu, toggleActive } =
  useMenus();

const {
  dialogOpen,
  editingId,
  saving,
  formError,
  closeDialog,
  form,
  openCreate,
  openEdit,
  clampPrice,
  toggleProduct,
  setQuantity,
  save,
} = useMenuForm({ createMenu, updateMenu });

const { confirmOpen, deleting, deleteError, openDelete, closeConfirm, runDelete } =
  useAdminConfirm();
const { actionError, toggle } = useAvailabilityToggle(toggleActive);

const columns: Column<MenuRow>[] = [
  { key: 'name', label: ADMIN_LABELS.fields.menu, sortable: true },
  { key: 'productCount', label: ROUTE_TITLES.PRODUCTOS, sortable: true, align: 'right' },
  { key: 'price', label: ADMIN_LABELS.fields.price, sortable: true, align: 'right' },
  {
    key: 'active',
    label: ADMIN_LABELS.fields.status,
    align: 'right',
    sortable: true,
    accessor: (menu) => String(menu.active),
    filter: {
      type: 'select',
      options: [
        { value: 'true', label: ADMIN_LABELS.status.active },
        { value: 'false', label: ADMIN_LABELS.status.inactive },
      ],
    },
  },
  { key: 'actions', label: ADMIN_LABELS.fields.actions, align: 'right' },
];

function patchForm(patch: Partial<typeof form>) {
  Object.assign(form, patch);
}

async function confirmDelete() {
  await runDelete(removeMenu);
}
</script>

<template>
  <div class="menus-view">
    <AdminPageHeader
      :title="ROUTE_TITLES.MENUS"
      :new-label="ADMIN_LABELS.menu.newLabel"
      @create="openCreate"
    />

    <p v-if="actionError" class="action-error" role="alert">{{ actionError }}</p>

    <DataTable
      :items="menus"
      :columns="columns"
      :loading="loading"
      :error="error"
      :page-size="PRODUCTS_PER_PAGE"
      :page-size-options="PAGE_SIZE_OPTIONS"
      default-sort="name"
      :search-placeholder="ADMIN_LABELS.menu.searchPlaceholder"
    >
      <template #cell-name="{ row }">
        <span class="menu-name">{{ row.name }}</span>
      </template>

      <template #cell-productCount="{ row }">{{
        ADMIN_LABELS.counts.products(row.productCount)
      }}</template>

      <template #cell-price="{ row }">{{ formatCurrency(row.price) }}</template>

      <template #cell-active="{ row }">
        <button
          type="button"
          class="status-toggle"
          :class="row.active ? 'status-active' : 'status-inactive'"
          @click="toggle(row.id)"
        >
          {{ row.active ? ADMIN_LABELS.status.active : ADMIN_LABELS.status.inactive }}
        </button>
      </template>

      <template #cell-actions="{ row }">
        <div class="row-actions">
          <button class="action-btn" @click="openEdit(row)">{{ UI_LABELS.edit }}</button>
          <button class="action-btn danger" @click="openDelete(row.id)">
            {{ UI_LABELS.remove }}
          </button>
        </div>
      </template>
    </DataTable>

    <MenuFormDialog
      :open="dialogOpen"
      :editing-id="editingId"
      :saving="saving"
      :error="formError"
      :form="form"
      :products="products"
      @close="closeDialog"
      @submit="save"
      @clamp-price="clampPrice"
      @update:form="patchForm"
      @toggle-product="toggleProduct"
      @set-quantity="setQuantity"
    />

    <ConfirmDialog
      v-if="confirmOpen"
      :title="ADMIN_LABELS.menu.deleteTitle"
      :message="ADMIN_LABELS.menu.deleteMessage"
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
  color: v-bind('colors.neutral.mutedText');
}

.row-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.action-btn {
  padding: 5px 12px;
  min-height: 2.75rem;
  background: v-bind('colors.neutral.borderSubtle');
  color: v-bind('colors.neutral.textMedium');
  border: none;
  border-radius: 8px;
  font-size: var(--font-xs);
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
</style>

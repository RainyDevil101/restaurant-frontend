<script setup lang="ts">
import { computed } from 'vue';
import { colors } from '@/shared/styles/colors';
import { useProducts } from '../composables/useProducts';
import type { ProductRow } from '../domain';
import { useProductForm } from '../composables/useProductForm';
import { useAvailabilityToggle } from '../composables/useAvailabilityToggle';
import { useAdminConfirm } from '../composables/useAdminConfirm';
import AdminPageHeader from '../components/AdminPageHeader.vue';
import ProductFormDialog from '../components/ProductFormDialog.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import DataTable, { type Column } from '@/shared/components/DataTable.vue';
import { formatCurrency } from '../helpers/formatCurrency';
import { ADMIN_LABELS, PRODUCTS_PER_PAGE, PAGE_SIZE_OPTIONS } from '../constants';
import { ROUTE_TITLES } from '@/shared/constants/brand';
import { UI_LABELS } from '@/shared/constants/ui';

const {
  products,
  categories,
  areas,
  loading,
  error,
  createProduct,
  updateProduct,
  removeProduct,
  toggleAvailability,
  createArea,
  createCategory,
} = useProducts();

const { toggle, actionError } = useAvailabilityToggle(toggleAvailability);
const {
  dialogOpen,
  editingId,
  saving,
  formError,
  closeDialog,
  form,
  inlineArea,
  inlineCat,
  areas: formAreas,
  clampPrice,
  openCreate,
  openEdit,
  save,
} = useProductForm({ categories, areas, createProduct, updateProduct, createArea, createCategory });
const { confirmOpen, deleting, deleteError, openDelete, closeConfirm, runDelete } =
  useAdminConfirm();

const columns = computed<Column<ProductRow>[]>(() => [
  { key: 'name', label: ADMIN_LABELS.fields.product, sortable: true },
  {
    key: 'categoryName',
    label: ADMIN_LABELS.fields.category,
    sortable: true,
    filter: {
      type: 'select',
      options: categories.value.map((category) => ({ value: category.name, label: category.name })),
    },
  },
  { key: 'price', label: ADMIN_LABELS.fields.price, sortable: true, align: 'right' },
  {
    key: 'available',
    label: ADMIN_LABELS.fields.status,
    align: 'right',
    sortable: true,
    accessor: (product) => String(product.available),
    filter: {
      type: 'select',
      options: [
        { value: 'true', label: ADMIN_LABELS.status.available },
        { value: 'false', label: ADMIN_LABELS.status.unavailable },
      ],
    },
  },
  { key: 'actions', label: ADMIN_LABELS.fields.actions, align: 'right' },
]);

function patchForm(patch: Partial<typeof form>) {
  Object.assign(form, patch);
}

async function confirmDelete() {
  await runDelete(removeProduct);
}
</script>

<template>
  <div class="products-view">
    <AdminPageHeader
      :title="ROUTE_TITLES.PRODUCTOS"
      :new-label="ADMIN_LABELS.product.newLabel"
      @create="openCreate"
    />

    <p v-if="actionError" class="action-error" role="alert">{{ actionError }}</p>

    <DataTable
      :items="products"
      :columns="columns"
      :loading="loading"
      :error="error"
      :page-size="PRODUCTS_PER_PAGE"
      :page-size-options="PAGE_SIZE_OPTIONS"
      default-sort="name"
      :search-placeholder="ADMIN_LABELS.product.searchPlaceholder"
    >
      <template #cell-price="{ row }">{{ formatCurrency(row.price) }}</template>

      <template #cell-available="{ row }">
        <button
          type="button"
          class="status-toggle"
          :class="row.available ? 'status-available' : 'status-unavailable'"
          @click="toggle(row.id)"
        >
          {{ row.available ? ADMIN_LABELS.status.available : ADMIN_LABELS.status.unavailable }}
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

    <ProductFormDialog
      :open="dialogOpen"
      :editing-id="editingId"
      :saving="saving"
      :error="formError"
      :form="form"
      :categories="categories"
      :areas="formAreas"
      :inline-area="inlineArea"
      :inline-cat="inlineCat"
      @close="closeDialog"
      @submit="save"
      @clamp-price="clampPrice"
      @update:form="patchForm"
      @update:inline-area-input="(v) => (inlineArea.inputName.value = v)"
      @update:inline-cat-input="(v) => (inlineCat.inputName.value = v)"
      @update:inline-cat-area="(v) => (inlineCat.inputAreaId.value = v)"
    />

    <ConfirmDialog
      v-if="confirmOpen"
      :title="ADMIN_LABELS.product.deleteTitle"
      :message="ADMIN_LABELS.product.deleteMessage"
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
  color: v-bind('colors.feedback.error');
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

.status-available {
  color: v-bind('colors.feedback.success');
}

.status-unavailable {
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

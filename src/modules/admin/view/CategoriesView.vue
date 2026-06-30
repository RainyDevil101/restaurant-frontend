<script setup lang="ts">
import { computed, reactive } from 'vue';
import { colors } from '@/shared/styles/colors';
import { useCategories } from '../composables/useCategories';
import type { CategoryRow } from '../domain';
import { useAdminDialog } from '../composables/useAdminDialog';
import { useAdminConfirm } from '../composables/useAdminConfirm';
import { useInlineAreaCreate } from '../composables/useInlineAreaCreate';
import AdminPageHeader from '../components/AdminPageHeader.vue';
import AdminFormField from '../components/AdminFormField.vue';
import ModalDialog from '../components/ModalDialog.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import DataTable, { type Column } from '@/shared/components/DataTable.vue';
import { ADMIN_LABELS, PRODUCTS_PER_PAGE, PAGE_SIZE_OPTIONS } from '../constants';
import { ROUTE_TITLES } from '@/shared/constants/brand';
import { UI_LABELS } from '@/shared/constants/ui';

const {
  categories,
  areas,
  loading,
  error,
  createArea,
  createCategory,
  updateCategory,
  removeCategory,
} = useCategories();

const inlineArea = useInlineAreaCreate(createArea, {
  onCreated: (id) => {
    form.areaId = id;
  },
});
const inlineAreaInput = inlineArea.inputName;

const columns = computed<Column<CategoryRow>[]>(() => [
  { key: 'name', label: ADMIN_LABELS.fields.category, sortable: true },
  {
    key: 'areaName',
    label: ADMIN_LABELS.fields.area,
    sortable: true,
    filter: {
      type: 'select',
      options: areas.value.map((area) => ({ value: area.name, label: area.name })),
    },
  },
  { key: 'productCount', label: ROUTE_TITLES.PRODUCTOS, sortable: true, align: 'right' },
  { key: 'actions', label: ADMIN_LABELS.fields.actions, align: 'right' },
]);

const form = reactive({ name: '', areaId: '' });
const {
  dialogOpen,
  editingId,
  saving,
  formError,
  openCreate: _openCreate,
  openEdit: _openEdit,
  runSave,
} = useAdminDialog();
const { confirmOpen, deleting, deleteError, openDelete, closeConfirm, runDelete } =
  useAdminConfirm();

function openCreate() {
  form.name = '';
  form.areaId = '';
  _openCreate();
}

function openEdit(category: CategoryRow) {
  form.name = category.name;
  form.areaId = category.areaId ?? '';
  _openEdit(category.id);
}

async function save() {
  const trimmedName = form.name.trim();
  if (!trimmedName) {
    formError.value = ADMIN_LABELS.category.nameRequired;
    return;
  }
  if (!form.areaId) {
    formError.value = ADMIN_LABELS.category.areaRequired;
    return;
  }
  const payload = { name: trimmedName, areaId: form.areaId };
  await runSave(async () => {
    if (editingId.value) await updateCategory(editingId.value, payload);
    else await createCategory(payload);
  });
}

async function confirmDelete() {
  await runDelete(removeCategory);
}
</script>

<template>
  <div class="categories-view">
    <AdminPageHeader
      :title="ROUTE_TITLES.CATEGORIAS"
      :new-label="ADMIN_LABELS.category.newLabel"
      @create="openCreate"
    />

    <DataTable
      :items="categories"
      :columns="columns"
      :loading="loading"
      :error="error"
      :page-size="PRODUCTS_PER_PAGE"
      :page-size-options="PAGE_SIZE_OPTIONS"
      default-sort="name"
      :search-placeholder="ADMIN_LABELS.category.searchPlaceholder"
    >
      <template #cell-name="{ row }">
        <span class="category-name">{{ row.name }}</span>
      </template>

      <template #cell-areaName="{ row }">
        <span class="col-muted">{{ row.areaName }}</span>
      </template>

      <template #cell-productCount="{ row }">{{
        ADMIN_LABELS.counts.products(row.productCount)
      }}</template>

      <template #cell-actions="{ row }">
        <div class="row-actions">
          <button class="action-btn" @click="openEdit(row)">{{ UI_LABELS.edit }}</button>
          <button
            class="action-btn danger"
            :disabled="row.productCount > 0"
            :title="row.productCount > 0 ? ADMIN_LABELS.category.deleteBlockedTitle : undefined"
            @click="openDelete(row.id)"
          >
            {{ UI_LABELS.remove }}
          </button>
        </div>
      </template>
    </DataTable>

    <ModalDialog
      v-if="dialogOpen"
      :title="editingId ? ADMIN_LABELS.category.editTitle : ADMIN_LABELS.category.newLabel"
      :saving="saving"
      :error="formError"
      @close="dialogOpen = false"
      @submit="save"
    >
      <AdminFormField :label="ADMIN_LABELS.fields.name" for="cat-name">
        <input id="cat-name" v-model="form.name" class="field-input" required />
      </AdminFormField>
      <AdminFormField
        :label="ADMIN_LABELS.fields.area"
        :for="areas.length === 0 && !editingId ? 'inline-area-input' : 'cat-area'"
      >
        <template v-if="areas.length === 0 && !editingId">
          <div class="no-area-notice" role="alert">
            <span class="notice-title">{{ ADMIN_LABELS.area.noAreasNotice }}</span>
            <span class="notice-hint">{{ ADMIN_LABELS.area.noAreasHint }}</span>
          </div>
          <div class="inline-form">
            <input
              id="inline-area-input"
              v-model="inlineAreaInput"
              class="field-input"
              :placeholder="ADMIN_LABELS.area.namePlaceholder"
              :disabled="inlineArea.creating.value"
            />
            <button
              type="button"
              class="inline-btn"
              :disabled="inlineArea.creating.value || !inlineAreaInput.trim()"
              @click="inlineArea.submit()"
            >
              {{
                inlineArea.creating.value
                  ? ADMIN_LABELS.product.creating
                  : ADMIN_LABELS.area.createButton
              }}
            </button>
          </div>
          <p v-if="inlineArea.error.value" class="inline-error">{{ inlineArea.error.value }}</p>
        </template>
        <select v-else id="cat-area" v-model="form.areaId" class="field-input" required>
          <option value="" disabled>{{ ADMIN_LABELS.area.selectPlaceholder }}</option>
          <option v-for="a in areas" :key="a.id" :value="a.id">{{ a.name }}</option>
        </select>
      </AdminFormField>
    </ModalDialog>

    <ConfirmDialog
      v-if="confirmOpen"
      :title="ADMIN_LABELS.category.deleteTitle"
      :message="ADMIN_LABELS.category.deleteMessage"
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
  min-height: 2.75rem;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 8px;
  font-size: var(--font-xs);
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

.no-area-notice {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 14px;
  background: #fffbeb;
  border: 1.5px solid #fcd34d;
  border-radius: 10px;
  margin-bottom: 10px;
}

.notice-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #92400e;
}

.notice-hint {
  font-size: var(--font-xs);
  color: #b45309;
}

.inline-form {
  display: flex;
  gap: 8px;
}

.inline-btn {
  flex-shrink: 0;
  padding: 10px 14px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: var(--font-xs);
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: background 0.15s;
}

.inline-btn:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.inline-btn:disabled {
  background: #c8d8d6;
  cursor: not-allowed;
}

.inline-error {
  font-size: var(--font-xs);
  color: #dc2626;
  margin-top: 4px;
}
</style>

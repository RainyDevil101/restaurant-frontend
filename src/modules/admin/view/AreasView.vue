<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useAreas } from '../composables/useAreas';
import type { AreaRow } from '../domain';
import { useAdminDialog } from '../composables/useAdminDialog';
import { useAdminConfirm } from '../composables/useAdminConfirm';
import AdminPageHeader from '../components/AdminPageHeader.vue';
import AdminFormField from '../components/AdminFormField.vue';
import ModalDialog from '../components/ModalDialog.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import DataTable, { type Column } from '@/shared/components/DataTable.vue';
import { ADMIN_LABELS, PRODUCTS_PER_PAGE, PAGE_SIZE_OPTIONS } from '../constants';
import { ROUTE_TITLES } from '@/shared/constants/brand';
import { UI_LABELS } from '@/shared/constants/ui';

const { areas, loading, error, createArea, updateArea, removeArea } = useAreas();

const columns = computed<Column<AreaRow>[]>(() => [
  { key: 'name', label: ADMIN_LABELS.fields.area, sortable: true },
  { key: 'categoryCount', label: ROUTE_TITLES.CATEGORIAS, sortable: true, align: 'right' },
  { key: 'actions', label: ADMIN_LABELS.fields.actions, align: 'right' },
]);

const form = reactive({ name: '' });
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
  _openCreate();
}

function openEdit(area: AreaRow) {
  form.name = area.name;
  _openEdit(area.id);
}

async function save() {
  const trimmedName = form.name.trim();
  if (!trimmedName) {
    formError.value = ADMIN_LABELS.area.nameRequired;
    return;
  }
  await runSave(async () => {
    if (editingId.value) await updateArea(editingId.value, { name: trimmedName });
    else await createArea({ name: trimmedName });
  });
}

async function confirmDelete() {
  await runDelete(removeArea);
}
</script>

<template>
  <div class="areas-view">
    <AdminPageHeader
      :title="ROUTE_TITLES.AREAS"
      :new-label="ADMIN_LABELS.area.newLabel"
      @create="openCreate"
    />

    <DataTable
      :items="areas"
      :columns="columns"
      :loading="loading"
      :error="error"
      :page-size="PRODUCTS_PER_PAGE"
      :page-size-options="PAGE_SIZE_OPTIONS"
      default-sort="name"
      :search-placeholder="ADMIN_LABELS.area.searchPlaceholder"
      :empty-text="ADMIN_LABELS.area.emptyText"
    >
      <template #cell-name="{ row }">
        <span class="area-name">{{ row.name }}</span>
      </template>

      <template #cell-categoryCount="{ row }">{{
        ADMIN_LABELS.counts.categories(row.categoryCount)
      }}</template>

      <template #cell-actions="{ row }">
        <div class="row-actions">
          <button class="action-btn" @click="openEdit(row)">{{ UI_LABELS.edit }}</button>
          <button
            class="action-btn danger"
            :disabled="row.categoryCount > 0"
            :title="row.categoryCount > 0 ? ADMIN_LABELS.area.deleteBlockedTitle : undefined"
            @click="openDelete(row.id)"
          >
            {{ UI_LABELS.remove }}
          </button>
        </div>
      </template>
    </DataTable>

    <ModalDialog
      v-if="dialogOpen"
      :title="editingId ? ADMIN_LABELS.area.editTitle : ADMIN_LABELS.area.newLabel"
      :saving="saving"
      :error="formError"
      @close="dialogOpen = false"
      @submit="save"
    >
      <AdminFormField :label="ADMIN_LABELS.fields.name" for="area-name">
        <input id="area-name" v-model="form.name" class="field-input" required />
      </AdminFormField>
    </ModalDialog>

    <ConfirmDialog
      v-if="confirmOpen"
      :title="ADMIN_LABELS.area.deleteTitle"
      :message="ADMIN_LABELS.area.deleteMessage"
      :saving="deleting"
      :error="deleteError"
      @close="closeConfirm"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped>
.areas-view {
  padding: 1.75rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.area-name {
  font-weight: 600;
  color: #111827;
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
</style>

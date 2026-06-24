<script setup lang="ts">
import { computed, reactive } from 'vue';
import { colors } from '@/shared/styles/colors';
import { useAdminTables, type TableRow } from '../composables/useAdminTables';
import { useAdminDialog } from '../composables/useAdminDialog';
import { useAdminConfirm } from '../composables/useAdminConfirm';
import AdminPageHeader from '../components/AdminPageHeader.vue';
import AdminFormField from '../components/AdminFormField.vue';
import ModalDialog from '../components/ModalDialog.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import Badge from '@/shared/components/Badge.vue';
import DataTable, { type Column } from '@/shared/components/DataTable.vue';
import {
  ADMIN_LABELS,
  TABLE_CAPACITY_MAX,
  PRODUCTS_PER_PAGE,
  PAGE_SIZE_OPTIONS,
} from '../constants';

const { tables, loading, error, createTable, updateTable, removeTable } = useAdminTables();

const STATUS_MAP = ADMIN_LABELS.table.statusLabels;

const columns = computed<Column<TableRow>[]>(() => [
  { key: 'name', label: 'Mesa', sortable: true },
  { key: 'capacity', label: 'Capacidad', sortable: true, align: 'right' },
  {
    key: 'status',
    label: 'Estado',
    align: 'right',
    sortable: true,
    filter: {
      type: 'select',
      options: Object.entries(STATUS_MAP).map(([value, meta]) => ({ value, label: meta.label })),
    },
  },
  { key: 'actions', label: 'Acciones', align: 'right' },
]);

const form = reactive({ name: '', capacity: 2 });
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
  form.capacity = 2;
  _openCreate();
}

function openEdit(table: TableRow) {
  form.name = table.name;
  form.capacity = table.capacity;
  _openEdit(table.id);
}

function clampCapacity() {
  form.capacity = Math.round(form.capacity);
  if (form.capacity > TABLE_CAPACITY_MAX) form.capacity = TABLE_CAPACITY_MAX;
  if (form.capacity < 1) form.capacity = 1;
}

async function save() {
  const trimmedName = form.name.trim();
  if (!trimmedName) {
    formError.value = ADMIN_LABELS.table.nameRequired;
    return;
  }
  if (!Number.isInteger(form.capacity) || form.capacity < 1 || form.capacity > TABLE_CAPACITY_MAX) {
    formError.value = ADMIN_LABELS.table.capacityInvalid;
    return;
  }
  const payload = { name: trimmedName, capacity: form.capacity };
  await runSave(async () => {
    if (editingId.value) await updateTable(editingId.value, payload);
    else await createTable(payload);
  });
}

async function confirmDelete() {
  await runDelete(removeTable);
}
</script>

<template>
  <div class="tables-view">
    <AdminPageHeader title="Mesas" new-label="Nueva mesa" @create="openCreate" />

    <DataTable
      :items="tables"
      :columns="columns"
      :loading="loading"
      :error="error"
      :page-size="PRODUCTS_PER_PAGE"
      :page-size-options="PAGE_SIZE_OPTIONS"
      default-sort="name"
      search-placeholder="Buscar mesa..."
    >
      <template #cell-name="{ row }">
        <span class="table-name">{{ row.name }}</span>
      </template>

      <template #cell-capacity="{ row }">{{ row.capacity }} pers.</template>

      <template #cell-status="{ row }">
        <Badge :tone="STATUS_MAP[row.status]?.tone ?? 'gray'">{{
          STATUS_MAP[row.status]?.label ?? row.status
        }}</Badge>
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
      :title="editingId ? 'Editar mesa' : 'Nueva mesa'"
      :saving="saving"
      :error="formError"
      @close="dialogOpen = false"
      @submit="save"
    >
      <AdminFormField label="Nombre" for="table-name">
        <input id="table-name" v-model="form.name" class="field-input" required />
      </AdminFormField>
      <AdminFormField label="Capacidad" for="table-cap">
        <input
          id="table-cap"
          v-model.number="form.capacity"
          class="field-input"
          type="number"
          min="1"
          :max="TABLE_CAPACITY_MAX"
          step="1"
          required
          @input="clampCapacity"
          @focus="($event.target as HTMLInputElement).select()"
        />
      </AdminFormField>
    </ModalDialog>

    <ConfirmDialog
      v-if="confirmOpen"
      title="Eliminar mesa"
      message="¿Seguro que deseas eliminar esta mesa? Esta acción no se puede deshacer."
      :saving="deleting"
      :error="deleteError"
      @close="closeConfirm"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped>
.tables-view {
  padding: 1.75rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.table-name {
  font-weight: 600;
  color: v-bind('colors.neutral.textStrong');
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

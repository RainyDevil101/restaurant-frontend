<script setup lang="ts">
import { computed, reactive } from 'vue';
import { colors } from '@/shared/styles/colors';
import { useUsers } from '../composables/useUsers';
import { useAdminDialog } from '../composables/useAdminDialog';
import { useAdminConfirm } from '../composables/useAdminConfirm';
import { roleLabel } from '../helpers/roleLabel';
import AdminPageHeader from '../components/AdminPageHeader.vue';
import AdminFormField from '../components/AdminFormField.vue';
import ModalDialog from '../components/ModalDialog.vue';
import ConfirmDialog from '../components/ConfirmDialog.vue';
import Badge from '@/shared/components/Badge.vue';
import DataTable, { type Column } from '@/shared/components/DataTable.vue';
import { Role, useAuthStore, type User } from '@/modules/auth/store';
import { ADMIN_LABELS, PRODUCTS_PER_PAGE, PAGE_SIZE_OPTIONS } from '../constants';
import { EMAIL_RE, PIN_RE, PIN_LENGTH, NON_DIGIT_RE } from '@/shared/constants/validation';
import { ROUTE_TITLES } from '@/shared/constants/brand';
import { UI_LABELS } from '@/shared/constants/ui';
import { EMPTY_VALUE } from '@/shared/constants/display';

function onPinInput(e: Event) {
  const el = e.target as HTMLInputElement;
  const digits = el.value.replace(NON_DIGIT_RE, '').slice(0, PIN_LENGTH);
  form.credential = digits;
  el.value = digits;
}

const auth = useAuthStore();
const currentUserId = computed(() => auth.user?.id ?? '');

const { users, loading, error, createUser, updateUser, removeUser } = useUsers();

const roleOptions = [Role.MESERO, Role.CAJERO, Role.ADMIN];

function canEditUser(row: User): boolean {
  return !row.isOwner || row.id === currentUserId.value;
}

function canDeleteUser(row: User): boolean {
  return !row.isOwner && row.id !== currentUserId.value;
}

const columns = computed<Column<User>[]>(() => [
  { key: 'name', label: ADMIN_LABELS.fields.user, sortable: true },
  { key: 'email', label: ADMIN_LABELS.fields.email, sortable: true },
  {
    key: 'role',
    label: ADMIN_LABELS.fields.role,
    sortable: true,
    filter: {
      type: 'select',
      options: roleOptions.map((role) => ({ value: role, label: roleLabel(role).label })),
    },
  },
  {
    key: 'active',
    label: ADMIN_LABELS.fields.status,
    align: 'right',
    sortable: true,
    accessor: (user) => String(user.active),
    filter: {
      type: 'select',
      options: [
        { value: 'true', label: ADMIN_LABELS.status.active },
        { value: 'false', label: ADMIN_LABELS.status.inactive },
      ],
    },
  },
  { key: 'actions', label: ADMIN_LABELS.fields.actions, align: 'right' },
]);

const form = reactive({
  name: '',
  email: '',
  role: Role.MESERO as Role,
  credential: '',
  active: true,
});
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
  form.email = '';
  form.role = Role.MESERO;
  form.credential = '';
  form.active = true;
  _openCreate();
}

function openEdit(user: User) {
  form.name = user.name;
  form.email = user.email;
  form.role = user.role;
  form.credential = '';
  form.active = user.active;
  _openEdit(user.id);
}

async function save() {
  const trimmedName = form.name.trim();
  if (!trimmedName) {
    formError.value = ADMIN_LABELS.user.nameRequired;
    return;
  }
  const trimmedEmail = form.email.trim();
  if (!trimmedEmail) {
    formError.value = ADMIN_LABELS.user.emailRequired;
    return;
  }
  if (!EMAIL_RE.test(trimmedEmail)) {
    formError.value = ADMIN_LABELS.user.emailInvalid;
    return;
  }
  if (!editingId.value && !form.credential) {
    formError.value = ADMIN_LABELS.user.credentialRequired;
    return;
  }
  if (form.credential && !PIN_RE.test(form.credential)) {
    formError.value = ADMIN_LABELS.user.credentialInvalid;
    return;
  }
  await runSave(async () => {
    if (editingId.value) {
      const input: Parameters<typeof updateUser>[1] = {
        name: trimmedName,
        email: trimmedEmail,
        role: form.role,
        active: form.active,
      };
      if (form.credential) input.credential = form.credential;
      await updateUser(editingId.value, input);
    } else {
      await createUser({
        name: trimmedName,
        email: trimmedEmail,
        role: form.role,
        credential: form.credential,
      });
    }
  });
}

async function confirmDelete() {
  await runDelete(removeUser);
}
</script>

<template>
  <div class="users-view">
    <AdminPageHeader
      :title="ROUTE_TITLES.USUARIOS"
      :new-label="ADMIN_LABELS.user.newLabel"
      @create="openCreate"
    />

    <DataTable
      :items="users"
      :columns="columns"
      :loading="loading"
      :error="error"
      :page-size="PRODUCTS_PER_PAGE"
      :page-size-options="PAGE_SIZE_OPTIONS"
      default-sort="name"
      :search-placeholder="ADMIN_LABELS.user.searchPlaceholder"
    >
      <template #cell-name="{ row }">
        <span class="col-name">{{ row.name }}</span>
        <Badge v-if="row.isOwner" tone="amber">{{ ADMIN_LABELS.user.ownerBadge }}</Badge>
      </template>

      <template #cell-email="{ row }">
        <span class="col-muted">{{ row.email }}</span>
      </template>

      <template #cell-role="{ row }">
        <Badge :tone="roleLabel(row.role).tone">{{ roleLabel(row.role).label }}</Badge>
      </template>

      <template #cell-active="{ row }">
        <Badge :tone="row.active ? 'green' : 'gray'">{{
          row.active ? ADMIN_LABELS.status.active : ADMIN_LABELS.status.inactive
        }}</Badge>
      </template>

      <template #cell-actions="{ row }">
        <div class="row-actions">
          <button v-if="canEditUser(row)" class="action-btn" @click="openEdit(row)">
            {{ UI_LABELS.edit }}
          </button>
          <button v-if="canDeleteUser(row)" class="action-btn danger" @click="openDelete(row.id)">
            {{ UI_LABELS.remove }}
          </button>
          <span v-if="!canEditUser(row) && !canDeleteUser(row)" class="col-muted">{{
            EMPTY_VALUE
          }}</span>
        </div>
      </template>
    </DataTable>

    <ModalDialog
      v-if="dialogOpen"
      :title="editingId ? ADMIN_LABELS.user.editTitle : ADMIN_LABELS.user.newLabel"
      :saving="saving"
      :error="formError"
      @close="dialogOpen = false"
      @submit="save"
    >
      <AdminFormField :label="ADMIN_LABELS.fields.name" for="user-name">
        <input id="user-name" v-model="form.name" class="field-input" required />
      </AdminFormField>

      <AdminFormField :label="ADMIN_LABELS.fields.email" for="user-email">
        <input
          id="user-email"
          v-model="form.email"
          type="email"
          class="field-input"
          autocomplete="off"
          required
        />
      </AdminFormField>

      <AdminFormField :label="ADMIN_LABELS.fields.role" for="user-role">
        <select id="user-role" v-model="form.role" class="field-input">
          <option v-for="role in roleOptions" :key="role" :value="role">
            {{ roleLabel(role).label }}
          </option>
        </select>
      </AdminFormField>

      <AdminFormField :label="ADMIN_LABELS.user.pinFieldLabel(PIN_LENGTH)" for="user-credential">
        <input
          id="user-credential"
          v-model="form.credential"
          type="text"
          inputmode="numeric"
          :maxlength="PIN_LENGTH"
          class="field-input"
          autocomplete="off"
          :required="!editingId"
          :placeholder="
            editingId
              ? ADMIN_LABELS.user.pinKeepPlaceholder
              : ADMIN_LABELS.user.pinDigitsPlaceholder(PIN_LENGTH)
          "
          @input="onPinInput"
        />
      </AdminFormField>

      <label v-if="editingId && editingId !== currentUserId" class="check-field">
        <input v-model="form.active" type="checkbox" />
        <span>{{ ADMIN_LABELS.status.active }}</span>
      </label>
    </ModalDialog>

    <ConfirmDialog
      v-if="confirmOpen"
      :title="ADMIN_LABELS.user.deleteTitle"
      :message="ADMIN_LABELS.user.deleteMessage"
      :saving="deleting"
      :error="deleteError"
      @close="closeConfirm"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped>
.users-view {
  padding: 1.75rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.col-name {
  font-weight: 600;
  color: v-bind('colors.neutral.textStrong');
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

.check-field {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: v-bind('colors.neutral.textMedium');
}
</style>

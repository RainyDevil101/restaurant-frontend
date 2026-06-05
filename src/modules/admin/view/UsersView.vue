<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useUsers } from '../composables/useUsers'
import { useAdminDialog } from '../composables/useAdminDialog'
import { useAdminConfirm } from '../composables/useAdminConfirm'
import { roleLabel } from '../helpers/roleLabel'
import AdminPageHeader from '../components/AdminPageHeader.vue'
import AdminFormField from '../components/AdminFormField.vue'
import ModalDialog from '../components/ModalDialog.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import Badge from '@/shared/components/Badge.vue'
import DataTable, { type Column } from '@/shared/components/DataTable.vue'
import { Role, type User } from '@/modules/auth/store'
import { ADMIN_LABELS, PRODUCTS_PER_PAGE, PAGE_SIZE_OPTIONS } from '../constants'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const { users, loading, error, createUser, updateUser, removeUser } = useUsers()

const roleOptions = [Role.MESERO, Role.CAJERO, Role.ADMIN]

const columns = computed<Column<User>[]>(() => [
  { key: 'name', label: 'Usuario', sortable: true },
  { key: 'email', label: 'Correo' },
  {
    key: 'role',
    label: 'Rol',
    filter: {
      type: 'select',
      options: roleOptions.map((role) => ({ value: role, label: roleLabel(role).label })),
    },
  },
  {
    key: 'active',
    label: 'Estado',
    align: 'right',
    accessor: (user) => String(user.active),
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

const form = reactive({
  name: '',
  email: '',
  role: Role.MESERO as Role,
  credential: '',
  active: true,
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

function openCreate() {
  form.name = ''
  form.email = ''
  form.role = Role.MESERO
  form.credential = ''
  form.active = true
  _openCreate()
}

function openEdit(user: User) {
  form.name = user.name
  form.email = user.email
  form.role = user.role
  form.credential = ''
  form.active = user.active
  _openEdit(user.id)
}

async function save() {
  const trimmedName = form.name.trim()
  if (!trimmedName) {
    formError.value = ADMIN_LABELS.user.nameRequired
    return
  }
  const trimmedEmail = form.email.trim()
  if (!trimmedEmail) {
    formError.value = ADMIN_LABELS.user.emailRequired
    return
  }
  if (!EMAIL_RE.test(trimmedEmail)) {
    formError.value = ADMIN_LABELS.user.emailInvalid
    return
  }
  if (!editingId.value && !form.credential) {
    formError.value = ADMIN_LABELS.user.credentialRequired
    return
  }
  await runSave(async () => {
    if (editingId.value) {
      const input: Parameters<typeof updateUser>[1] = {
        name: trimmedName,
        email: trimmedEmail,
        role: form.role,
        active: form.active,
      }
      if (form.credential) input.credential = form.credential
      await updateUser(editingId.value, input)
    } else {
      await createUser({
        name: trimmedName,
        email: trimmedEmail,
        role: form.role,
        credential: form.credential,
      })
    }
  })
}

async function confirmDelete() {
  await runDelete(removeUser)
}
</script>

<template>
  <div class="users-view">
    <AdminPageHeader title="Usuarios" new-label="Nuevo usuario" @create="openCreate" />

    <DataTable
      :items="users"
      :columns="columns"
      :loading="loading"
      :error="error"
      :page-size="PRODUCTS_PER_PAGE"
      :page-size-options="PAGE_SIZE_OPTIONS"
      default-sort="name"
      search-placeholder="Buscar usuario..."
    >
      <template #cell-name="{ row }">
        <span class="col-name">{{ row.name }}</span>
      </template>

      <template #cell-email="{ row }">
        <span class="col-muted">{{ row.email }}</span>
      </template>

      <template #cell-role="{ row }">
        <Badge :tone="roleLabel(row.role).tone">{{ roleLabel(row.role).label }}</Badge>
      </template>

      <template #cell-active="{ row }">
        <Badge :tone="row.active ? 'green' : 'gray'">{{ row.active ? 'Activo' : 'Inactivo' }}</Badge>
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
      :title="editingId ? 'Editar usuario' : 'Nuevo usuario'"
      :saving="saving"
      :error="formError"
      @close="dialogOpen = false"
      @submit="save"
    >
      <AdminFormField label="Nombre" for="user-name">
        <input id="user-name" v-model="form.name" class="field-input" required />
      </AdminFormField>

      <AdminFormField label="Correo" for="user-email">
        <input id="user-email" v-model="form.email" type="email" class="field-input" required />
      </AdminFormField>

      <AdminFormField label="Rol" for="user-role">
        <select id="user-role" v-model="form.role" class="field-input">
          <option v-for="role in roleOptions" :key="role" :value="role">
            {{ roleLabel(role).label }}
          </option>
        </select>
      </AdminFormField>

      <AdminFormField label="Contraseña" for="user-credential">
        <input
          id="user-credential"
          v-model="form.credential"
          type="password"
          class="field-input"
          :required="!editingId"
          :placeholder="editingId ? 'Dejar en blanco para no cambiar' : ''"
        />
      </AdminFormField>

      <label v-if="editingId" class="check-field">
        <input v-model="form.active" type="checkbox" />
        <span>Activo</span>
      </label>
    </ModalDialog>

    <ConfirmDialog
      v-if="confirmOpen"
      title="Eliminar usuario"
      message="¿Seguro que deseas eliminar este usuario? Quedará desactivado y no podrá iniciar sesión."
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
  color: #111827;
}

.col-muted {
  color: #6b7280;
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

.check-field {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #374151;
}
</style>

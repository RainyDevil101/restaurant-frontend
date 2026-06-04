<script setup lang="ts">
import { reactive } from 'vue'
import { useUsers } from '../composables/useUsers'
import { useAdminDialog } from '../composables/useAdminDialog'
import { useAdminConfirm } from '../composables/useAdminConfirm'
import { roleLabel } from '../helpers/roleLabel'
import AdminPageHeader from '../components/AdminPageHeader.vue'
import AdminSearchBar from '../components/AdminSearchBar.vue'
import AdminPagination from '../components/AdminPagination.vue'
import AdminFormField from '../components/AdminFormField.vue'
import ModalDialog from '../components/ModalDialog.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import Badge from '@/shared/components/Badge.vue'
import { Role, type User } from '@/modules/auth/store'
import { ADMIN_LABELS, PAGE_SIZE_OPTIONS } from '../constants'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const {
  users,
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
  createUser,
  updateUser,
  removeUser,
} = useUsers()

const roleOptions = [Role.MESERO, Role.CAJERO, Role.ADMIN]

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

    <AdminSearchBar v-model="search" placeholder="Buscar usuario..." />

    <table class="data-table">
      <thead>
        <tr>
          <th>
            <button type="button" class="sort-header" @click="toggleSort('name')">
              Nombre
              <span class="sort-indicator">{{ sortBy === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : '' }}</span>
            </button>
          </th>
          <th>Correo</th>
          <th>
            <button type="button" class="sort-header" @click="toggleSort('role')">
              Rol
              <span class="sort-indicator">{{ sortBy === 'role' ? (sortDir === 'asc' ? '▲' : '▼') : '' }}</span>
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
        <tr v-for="user in users" :key="user.id" class="data-row">
          <td class="col-name">{{ user.name }}</td>
          <td class="col-muted">{{ user.email }}</td>
          <td>
            <Badge :tone="roleLabel(user.role).tone">{{ roleLabel(user.role).label }}</Badge>
          </td>
          <td class="col-right">
            <Badge :tone="user.active ? 'green' : 'gray'">{{ user.active ? 'Activo' : 'Inactivo' }}</Badge>
          </td>
          <td class="col-actions">
            <div class="row-actions">
              <button class="action-btn" @click="openEdit(user)">Editar</button>
              <button class="action-btn danger" @click="openDelete(user.id)">Eliminar</button>
            </div>
          </td>
        </tr>

        <tr
          v-for="i in users.length === 0 ? 0 : fillerCount"
          :key="'filler-' + i"
          class="filler-row"
          aria-hidden="true"
        >
          <td colspan="5"></td>
        </tr>

        <tr v-if="users.length === 0">
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

.empty-row {
  text-align: center;
  color: #9ca3af;
  padding: 2.5rem 0;
}

.error-text {
  color: #dc2626;
}

.check-field {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #374151;
}
</style>

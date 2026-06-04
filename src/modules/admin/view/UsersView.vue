<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useUsers } from '../composables/useUsers'
import { roleLabel } from '../helpers/roleLabel'
import ModalDialog from '../components/ModalDialog.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { ApiRequestError } from '@/shared/api/client'
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
  setPage,
  createUser,
  updateUser,
  removeUser,
} = useUsers()

const roleOptions = [Role.MESERO, Role.CAJERO, Role.ADMIN]

const dialogOpen = ref(false)
const editingId = ref<string | null>(null)
const saving = ref(false)
const formError = ref('')
const form = reactive({
  name: '',
  email: '',
  role: Role.MESERO as Role,
  credential: '',
  active: true,
})

function openCreate() {
  editingId.value = null
  form.name = ''
  form.email = ''
  form.role = Role.MESERO
  form.credential = ''
  form.active = true
  formError.value = ''
  dialogOpen.value = true
}

function openEdit(user: User) {
  editingId.value = user.id
  form.name = user.name
  form.email = user.email
  form.role = user.role
  form.credential = ''
  form.active = user.active
  formError.value = ''
  dialogOpen.value = true
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
  saving.value = true
  formError.value = ''
  try {
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
    dialogOpen.value = false
  } catch (err) {
    formError.value = err instanceof ApiRequestError ? err.message : 'No se pudo guardar.'
  } finally {
    saving.value = false
  }
}

const confirmOpen = ref(false)
const deletingId = ref<string | null>(null)
const deleting = ref(false)
const deleteError = ref('')

function openDelete(id: string) {
  deletingId.value = id
  deleteError.value = ''
  confirmOpen.value = true
}

async function confirmDelete() {
  if (!deletingId.value) return
  deleting.value = true
  deleteError.value = ''
  try {
    await removeUser(deletingId.value)
    confirmOpen.value = false
  } catch (err) {
    deleteError.value = err instanceof ApiRequestError ? err.message : 'No se pudo eliminar.'
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="users-view">
    <div class="page-header">
      <h1 class="page-title">Usuarios</h1>
      <button class="new-btn" @click="openCreate">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="18"
          height="18"
          aria-hidden="true"
        >
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
        </svg>
        Nuevo usuario
      </button>
    </div>

    <div class="search-wrap">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        width="16"
        height="16"
        class="search-icon"
        aria-hidden="true"
      >
        <path
          d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
        />
      </svg>
      <input v-model="search" class="search-input" placeholder="Buscar usuario..." />
    </div>

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
            <span
              class="role-badge"
              :style="{ background: roleLabel(user.role).bg, color: roleLabel(user.role).color }"
            >
              {{ roleLabel(user.role).label }}
            </span>
          </td>
          <td class="col-right">
            <span :class="user.active ? 'status-active' : 'status-inactive'">
              {{ user.active ? 'Activo' : 'Inactivo' }}
            </span>
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

    <div class="pagination">
      <div class="page-size">
        <label for="page-size">Filas por página</label>
        <select id="page-size" v-model.number="pageSize" class="page-size-select">
          <option v-for="size in PAGE_SIZE_OPTIONS" :key="size" :value="size">{{ size }}</option>
        </select>
      </div>
      <div class="page-nav">
        <button
          type="button"
          class="page-btn"
          :disabled="page <= 1"
          aria-label="Página anterior"
          @click="setPage(page - 1)"
        >◀</button>
        <span class="page-status">Página {{ page }} de {{ totalPages }}</span>
        <button
          type="button"
          class="page-btn"
          :disabled="page >= totalPages"
          aria-label="Página siguiente"
          @click="setPage(page + 1)"
        >▶</button>
      </div>
    </div>

    <ModalDialog
      v-if="dialogOpen"
      :title="editingId ? 'Editar usuario' : 'Nuevo usuario'"
      :saving="saving"
      :error="formError"
      @close="dialogOpen = false"
      @submit="save"
    >
      <div class="field">
        <label class="field-label" for="user-name">Nombre</label>
        <input id="user-name" v-model="form.name" class="field-input" required />
      </div>

      <div class="field">
        <label class="field-label" for="user-email">Correo</label>
        <input id="user-email" v-model="form.email" type="email" class="field-input" required />
      </div>

      <div class="field">
        <label class="field-label" for="user-role">Rol</label>
        <select id="user-role" v-model="form.role" class="field-input">
          <option v-for="role in roleOptions" :key="role" :value="role">
            {{ roleLabel(role).label }}
          </option>
        </select>
      </div>

      <div class="field">
        <label class="field-label" for="user-credential">Contraseña</label>
        <input
          id="user-credential"
          v-model="form.credential"
          type="password"
          class="field-input"
          :required="!editingId"
          :placeholder="editingId ? 'Dejar en blanco para no cambiar' : ''"
        />
      </div>

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
      @close="confirmOpen = false"
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

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #111827;
}

.new-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  transition: background 0.15s;
}

.new-btn:hover {
  background: var(--color-primary-dark);
}

.search-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f3f4f6;
  border-radius: 10px;
  padding: 9px 14px;
  max-width: 320px;
}

.search-icon {
  flex-shrink: 0;
  color: #9ca3af;
}

.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-size: 0.875rem;
  color: #1a1a1a;
  font-family: inherit;
}

.search-input::placeholder {
  color: #9ca3af;
}

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

.role-badge {
  display: inline-block;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
}

.status-active {
  color: #059669;
  font-weight: 600;
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

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.page-size {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #6b7280;
}

.page-size-select {
  padding: 6px 10px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.85rem;
  color: #111827;
  font-family: inherit;
  background: white;
  outline: none;
}

.page-size-select:focus {
  border-color: var(--color-primary);
}

.page-nav {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-status {
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
}

.page-btn {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 8px;
  font-size: 0.8rem;
}

.page-btn:hover:not(:disabled) {
  background: #e5e7eb;
}

.page-btn:disabled {
  color: #d1d5db;
  cursor: not-allowed;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.field-input {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.95rem;
  color: #111827;
  font-family: inherit;
  outline: none;
  transition: border-color 0.15s;
}

.field-input:focus {
  border-color: var(--color-primary);
}

.check-field {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #374151;
}
</style>

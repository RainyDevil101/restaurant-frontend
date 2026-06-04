import { computed } from 'vue'
import {
  createUser as apiCreateUser,
  updateUser as apiUpdateUser,
  deactivateUser as apiDeactivateUser,
  type CreateUserInput,
  type UpdateUserInput,
} from '@/shared/api/users'
import { useUsersStore } from '@/shared/stores/usersStore'
import { useTtlFreshness } from '@/shared/stores/useTtlFreshness'
import { useDataTable } from '@/shared/stores/useDataTable'
import { PRODUCTS_PER_PAGE } from '../constants'
import type { User } from '@/modules/auth/store'

export function useUsers() {
  const usersStore = useUsersStore()
  const { invalidateAndRefresh } = useTtlFreshness([usersStore])

  const loading = computed(() => usersStore.loading)
  const error = computed(() => usersStore.error ?? '')

  const userRows = computed<User[]>(() => usersStore.items)

  const table = useDataTable<User>(userRows, {
    sortBy: 'name',
    pageSize: PRODUCTS_PER_PAGE,
    sortAccessors: {
      name: (row) => row.name,
      role: (row) => row.role,
      active: (row) => (row.active ? 1 : 0),
    },
    searchAccessor: (row) => `${row.name} ${row.email}`,
  })

  async function createUser(input: CreateUserInput) {
    await apiCreateUser(input)
    await invalidateAndRefresh(usersStore)
  }

  async function updateUser(id: string, input: UpdateUserInput) {
    await apiUpdateUser(id, input)
    await invalidateAndRefresh(usersStore)
  }

  async function removeUser(id: string) {
    await apiDeactivateUser(id)
    await invalidateAndRefresh(usersStore)
  }

  return {
    users: table.rows,
    search: table.search,
    loading,
    error,
    page: table.page,
    pageSize: table.pageSize,
    totalPages: table.totalPages,
    sortBy: table.sortBy,
    sortDir: table.sortDir,
    toggleSort: table.toggleSort,
    setPage: table.setPage,
    reload: () => invalidateAndRefresh(usersStore),
    createUser,
    updateUser,
    removeUser,
  }
}

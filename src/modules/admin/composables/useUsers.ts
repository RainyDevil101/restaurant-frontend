import { ref, computed, onMounted } from 'vue'
import {
  listUsers,
  createUser as apiCreateUser,
  updateUser as apiUpdateUser,
  deactivateUser as apiDeactivateUser,
  type CreateUserInput,
  type UpdateUserInput,
} from '@/shared/api/users'
import { ApiRequestError } from '@/shared/api/client'
import type { User } from '@/modules/auth/store'

export function useUsers() {
  const search = ref('')
  const items = ref<User[]>([])
  const loading = ref(false)
  const error = ref('')

  async function load() {
    loading.value = true
    error.value = ''
    try {
      items.value = await listUsers()
    } catch (err) {
      error.value =
        err instanceof ApiRequestError ? err.message : 'No se pudieron cargar los usuarios.'
    } finally {
      loading.value = false
    }
  }

  onMounted(load)

  const users = computed(() => {
    const q = search.value.trim().toLowerCase()
    if (!q) return items.value
    return items.value.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    )
  })

  async function createUser(input: CreateUserInput) {
    await apiCreateUser(input)
    await load()
  }

  async function updateUser(id: string, input: UpdateUserInput) {
    await apiUpdateUser(id, input)
    await load()
  }

  async function removeUser(id: string) {
    await apiDeactivateUser(id)
    await load()
  }

  return { users, search, loading, error, reload: load, createUser, updateUser, removeUser }
}

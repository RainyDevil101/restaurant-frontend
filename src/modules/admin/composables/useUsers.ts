import { ref, computed } from 'vue'
import { mockUsers } from '@/shared/mocks'

export function useUsers() {
  const search = ref('')

  const users = computed(() => {
    const q = search.value.trim().toLowerCase()
    if (!q) return mockUsers
    return mockUsers.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    )
  })

  return { users, search }
}

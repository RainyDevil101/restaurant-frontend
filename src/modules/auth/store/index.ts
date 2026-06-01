import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export type Role = 'M' | 'C' | 'A'

export interface User {
  id: string
  name: string
  email: string
  role: Role
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)

  const isLoggedIn = computed(() => user.value !== null)

  const roleHome = computed((): string => {
    switch (user.value?.role) {
      case 'M':
        return '/service'
      case 'C':
        return '/checkout'
      case 'A':
        return '/admin'
      default:
        return '/'
    }
  })

  function login(newUser: User) {
    user.value = newUser
  }

  function logout() {
    user.value = null
  }

  return { user, isLoggedIn, roleHome, login, logout }
})

import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store'
import { mockUsers, MOCK_CREDENTIALS } from '@/shared/mocks/users'
import { ROLES } from '../constants'

export function useLogin() {
  const router = useRouter()
  const authStore = useAuthStore()

  const email = ref('')
  const credential = ref('')
  const showCredential = ref(false)
  const error = ref('')
  const loading = ref(false)

  const matchedUser = computed(() =>
    mockUsers.find((u) => u.email === email.value.trim().toLowerCase()) ?? null,
  )

  // Meseros authenticate with a numeric PIN; admin/cajero with a password
  const isPin = computed(() => matchedUser.value?.role === ROLES.WAITER)
  const credentialLabel = computed(() => (isPin.value ? 'PIN' : 'Contraseña'))
  const inputType = computed(() => (showCredential.value ? 'text' : 'password'))
  const inputMode = computed(() => (isPin.value ? ('numeric' as const) : undefined))

  async function submit() {
    error.value = ''
    const user = matchedUser.value

    if (!user) {
      error.value = 'Correo no encontrado.'
      return
    }

    // Dev-only plain-text check; production uses bcrypt.compare() for both passwords and PINs
    if (credential.value !== MOCK_CREDENTIALS[user.email]) {
      error.value = isPin.value ? 'PIN incorrecto.' : 'Contraseña incorrecta.'
      return
    }

    loading.value = true
    await new Promise((r) => setTimeout(r, 350))
    authStore.login(user)
    router.push(authStore.roleHome)
    loading.value = false
  }

  return {
    email,
    credential,
    showCredential,
    credentialLabel,
    inputType,
    inputMode,
    isPin,
    error,
    loading,
    submit,
  }
}

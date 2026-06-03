import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store'
import { requestLogin } from '../api'
import { ApiRequestError } from '@/shared/api/client'

export function useLogin() {
  const router = useRouter()
  const authStore = useAuthStore()

  const email = ref('')
  const credential = ref('')
  const showCredential = ref(false)
  const error = ref('')
  const loading = ref(false)

  const credentialLabel = computed(() => 'Contraseña o PIN')
  const inputType = computed(() => (showCredential.value ? 'text' : 'password'))
  const inputMode = computed(() => undefined)

  async function submit() {
    error.value = ''

    const trimmedEmail = email.value.trim().toLowerCase()
    if (!trimmedEmail || !credential.value) {
      error.value = 'Ingresa tu correo y credencial.'
      return
    }

    loading.value = true
    try {
      const { accessToken, user } = await requestLogin(trimmedEmail, credential.value)
      authStore.login(user, accessToken)
      router.push(authStore.roleHome)
    } catch (err) {
      if (err instanceof ApiRequestError) {
        error.value = err.statusCode === 401 ? 'Credenciales incorrectas.' : err.message
      } else {
        error.value = 'No se pudo conectar con el servidor.'
      }
    } finally {
      loading.value = false
    }
  }

  return {
    email,
    credential,
    showCredential,
    credentialLabel,
    inputType,
    inputMode,
    error,
    loading,
    submit,
  }
}

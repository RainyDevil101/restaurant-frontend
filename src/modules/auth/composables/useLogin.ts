import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store'
import { requestLogin } from '../api'
import { ApiRequestError } from '@/shared/api/client'
import { EMAIL_RE, LOGIN_LABELS } from '../constants'

export function useLogin() {
  const router = useRouter()
  const authStore = useAuthStore()

  const email = ref('')
  const credential = ref('')
  const showCredential = ref(false)
  const error = ref('')
  const loading = ref(false)

  const inputType = computed(() => (showCredential.value ? 'text' : 'password'))

  async function submit() {
    error.value = ''

    const trimmedEmail = email.value.trim().toLowerCase()
    if (!trimmedEmail || !credential.value) {
      error.value = LOGIN_LABELS.errorFieldsRequired
      return
    }
    if (!EMAIL_RE.test(trimmedEmail)) {
      error.value = LOGIN_LABELS.errorEmailInvalid
      return
    }

    loading.value = true
    try {
      const { accessToken, user } = await requestLogin(trimmedEmail, credential.value)
      authStore.login(user, accessToken)
      router.push(authStore.roleHome)
    } catch (err) {
      if (err instanceof ApiRequestError) {
        error.value = err.statusCode === 401 ? LOGIN_LABELS.errorInvalidCredentials : err.message
      } else {
        error.value = LOGIN_LABELS.errorNetwork
      }
    } finally {
      loading.value = false
    }
  }

  return {
    email,
    credential,
    showCredential,
    credentialLabel: LOGIN_LABELS.credentialLabel,
    inputType,
    error,
    loading,
    submit,
  }
}

import { ref } from 'vue'
import { ApiRequestError } from '@/shared/api/client'

export function useAvailabilityToggle(toggleFn: (id: string) => Promise<void>) {
  const actionError = ref('')

  async function toggle(id: string) {
    actionError.value = ''
    try {
      await toggleFn(id)
    } catch (err) {
      actionError.value = err instanceof ApiRequestError ? err.message : 'No se pudo actualizar.'
    }
  }

  return { actionError, toggle }
}

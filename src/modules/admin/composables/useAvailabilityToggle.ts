import { ref } from 'vue'
import { ApiRequestError } from '@/shared/api/client'
import { toast } from '@/shared/toast'

export function useAvailabilityToggle(toggleFn: (id: string) => Promise<void>) {
  const actionError = ref('')

  async function toggle(id: string) {
    actionError.value = ''
    try {
      await toggleFn(id)
      toast.success('Disponibilidad actualizada')
    } catch (err) {
      actionError.value = err instanceof ApiRequestError ? err.message : 'No se pudo actualizar.'
      toast.error(actionError.value)
    }
  }

  return { actionError, toggle }
}

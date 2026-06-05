import { ref } from 'vue'
import { ApiRequestError } from '@/shared/api/client'
import { toast } from '@/shared/toast'

export function useAdminConfirm() {
  const confirmOpen = ref(false)
  const deletingId = ref<string | null>(null)
  const deleting = ref(false)
  const deleteError = ref('')

  function openDelete(id: string) {
    deletingId.value = id
    deleteError.value = ''
    confirmOpen.value = true
  }

  function closeConfirm() {
    confirmOpen.value = false
    deletingId.value = null
  }

  async function runDelete(fn: (id: string) => Promise<void>) {
    if (!deletingId.value) return
    deleting.value = true
    deleteError.value = ''
    try {
      await fn(deletingId.value)
      confirmOpen.value = false
      toast.success('Eliminado correctamente')
    } catch (err) {
      deleteError.value = err instanceof ApiRequestError ? err.message : 'No se pudo eliminar.'
    } finally {
      deleting.value = false
    }
  }

  return { confirmOpen, deletingId, deleting, deleteError, openDelete, closeConfirm, runDelete }
}

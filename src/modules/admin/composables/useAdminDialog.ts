import { ref } from 'vue'
import { ApiRequestError } from '@/shared/api/client'
import { toast } from '@/shared/toast'

export function useAdminDialog() {
  const dialogOpen = ref(false)
  const editingId = ref<string | null>(null)
  const saving = ref(false)
  const formError = ref('')

  function openCreate() {
    editingId.value = null
    formError.value = ''
    dialogOpen.value = true
  }

  function openEdit(id: string) {
    editingId.value = id
    formError.value = ''
    dialogOpen.value = true
  }

  function closeDialog() {
    dialogOpen.value = false
  }

  async function runSave(fn: () => Promise<void>) {
    saving.value = true
    formError.value = ''
    try {
      await fn()
      dialogOpen.value = false
      toast.success('Guardado correctamente')
    } catch (err) {
      formError.value = err instanceof ApiRequestError ? err.message : 'No se pudo guardar.'
    } finally {
      saving.value = false
    }
  }

  return { dialogOpen, editingId, saving, formError, openCreate, openEdit, closeDialog, runSave }
}

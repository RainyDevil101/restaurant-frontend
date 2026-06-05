import { ref, onMounted } from 'vue'
import {
  getReceiptSettings,
  updateReceiptSettings,
  type ReceiptSettings,
  type UpdateReceiptInput,
} from '@/shared/api/settings'
import { ApiRequestError } from '@/shared/api/client'
import { toast } from '@/shared/toast'

export function useReceiptSettings() {
  const settings = ref<ReceiptSettings | null>(null)
  const loading = ref(false)
  const error = ref('')

  async function load() {
    loading.value = true
    error.value = ''
    try {
      settings.value = await getReceiptSettings()
    } catch (err) {
      error.value =
        err instanceof ApiRequestError
          ? err.message
          : 'No se pudieron cargar los datos del comprobante.'
    } finally {
      loading.value = false
    }
  }

  async function save(input: UpdateReceiptInput) {
    try {
      settings.value = await updateReceiptSettings(input)
      toast.success('Datos del comprobante guardados')
    } catch (err) {
      const message =
        err instanceof ApiRequestError ? err.message : 'No se pudieron guardar los datos.'
      toast.error(message)
      throw err
    }
  }

  onMounted(load)

  return { settings, loading, error, reload: load, save }
}

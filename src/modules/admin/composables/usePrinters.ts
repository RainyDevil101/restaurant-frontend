import { ref, onMounted } from 'vue'
import {
  listPrinters,
  createPrinter as apiCreatePrinter,
  updatePrinter as apiUpdatePrinter,
  deletePrinter as apiDeletePrinter,
  type Printer,
  type CreatePrinterInput,
  type UpdatePrinterInput,
} from '@/shared/api/settings'
import { ApiRequestError } from '@/shared/api/client'
import { toast } from '@/shared/toast'

export function usePrinters() {
  const printers = ref<Printer[]>([])
  const loading = ref(false)
  const error = ref('')

  async function load() {
    loading.value = true
    error.value = ''
    try {
      printers.value = await listPrinters()
    } catch (err) {
      error.value =
        err instanceof ApiRequestError ? err.message : 'No se pudieron cargar las impresoras.'
    } finally {
      loading.value = false
    }
  }

  async function createPrinter(input: CreatePrinterInput) {
    try {
      await apiCreatePrinter(input)
      await load()
      toast.success('Impresora creada')
    } catch (err) {
      const message =
        err instanceof ApiRequestError ? err.message : 'No se pudo crear la impresora.'
      toast.error(message)
      throw err
    }
  }

  async function updatePrinter(id: string, input: UpdatePrinterInput) {
    try {
      await apiUpdatePrinter(id, input)
      await load()
      toast.success('Impresora actualizada')
    } catch (err) {
      const message =
        err instanceof ApiRequestError ? err.message : 'No se pudo actualizar la impresora.'
      toast.error(message)
      throw err
    }
  }

  async function removePrinter(id: string) {
    try {
      await apiDeletePrinter(id)
      await load()
      toast.success('Impresora eliminada')
    } catch (err) {
      const message =
        err instanceof ApiRequestError ? err.message : 'No se pudo eliminar la impresora.'
      toast.error(message)
      throw err
    }
  }

  async function setDefault(id: string) {
    await updatePrinter(id, { isDefault: true })
  }

  onMounted(load)

  return {
    printers,
    loading,
    error,
    reload: load,
    createPrinter,
    updatePrinter,
    removePrinter,
    setDefault,
  }
}

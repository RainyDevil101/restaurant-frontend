import { ref, onMounted } from 'vue';
import {
  listPrinters,
  createPrinter as apiCreatePrinter,
  updatePrinter as apiUpdatePrinter,
  deletePrinter as apiDeletePrinter,
  type Printer,
  type CreatePrinterInput,
  type UpdatePrinterInput,
} from '@/shared/api/settings';
import { ApiRequestError } from '@/shared/api/client';
import { toast } from '@/shared/toast';
import { ADMIN_MESSAGES } from '../domain';

export function usePrinters() {
  const printers = ref<Printer[]>([]);
  const loading = ref(false);
  const error = ref('');

  async function load() {
    loading.value = true;
    error.value = '';
    try {
      printers.value = await listPrinters();
    } catch (err) {
      error.value =
        err instanceof ApiRequestError ? err.message : ADMIN_MESSAGES.LOAD_PRINTERS_ERROR;
    } finally {
      loading.value = false;
    }
  }

  async function createPrinter(input: CreatePrinterInput) {
    try {
      await apiCreatePrinter(input);
      await load();
      toast.success(ADMIN_MESSAGES.PRINTER_CREATED);
    } catch (err) {
      const message =
        err instanceof ApiRequestError ? err.message : ADMIN_MESSAGES.CREATE_PRINTER_ERROR;
      toast.error(message);
      throw err;
    }
  }

  async function updatePrinter(id: string, input: UpdatePrinterInput) {
    try {
      await apiUpdatePrinter(id, input);
      await load();
      toast.success(ADMIN_MESSAGES.PRINTER_UPDATED);
    } catch (err) {
      const message =
        err instanceof ApiRequestError ? err.message : ADMIN_MESSAGES.UPDATE_PRINTER_ERROR;
      toast.error(message);
      throw err;
    }
  }

  async function removePrinter(id: string) {
    try {
      await apiDeletePrinter(id);
      await load();
      toast.success(ADMIN_MESSAGES.PRINTER_DELETED);
    } catch (err) {
      const message =
        err instanceof ApiRequestError ? err.message : ADMIN_MESSAGES.DELETE_PRINTER_ERROR;
      toast.error(message);
      throw err;
    }
  }

  async function setDefault(id: string) {
    await updatePrinter(id, { isDefault: true });
  }

  onMounted(load);

  return {
    printers,
    loading,
    error,
    reload: load,
    createPrinter,
    updatePrinter,
    removePrinter,
    setDefault,
  };
}

import { ref, onMounted } from 'vue';
import { listTables } from '@/shared/api/venue';
import { ApiRequestError } from '@/shared/api/client';
import type { Table } from '@/shared/types';

export function useTables() {
  const tables = ref<Table[]>([]);
  const loading = ref(false);
  const error = ref('');

  async function load() {
    loading.value = true;
    error.value = '';
    try {
      tables.value = await listTables();
    } catch (err) {
      error.value =
        err instanceof ApiRequestError ? err.message : 'No se pudieron cargar las mesas.';
    } finally {
      loading.value = false;
    }
  }

  onMounted(load);

  return { tables, loading, error, reload: load };
}

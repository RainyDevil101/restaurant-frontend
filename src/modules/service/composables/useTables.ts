import { computed } from 'vue';
import { useTablesStore } from '@/shared/stores/venueStores';
import { useTtlFreshness } from '@/shared/stores/useTtlFreshness';
import type { Table } from '@/shared/types';

export function useTables() {
  const tablesStore = useTablesStore();
  const { invalidateAndRefresh } = useTtlFreshness([tablesStore]);

  const tables = computed<Table[]>(() => tablesStore.items);
  const loading = computed(() => tablesStore.loading);
  const error = computed(() => tablesStore.error ?? '');

  return { tables, loading, error, reload: () => invalidateAndRefresh(tablesStore) };
}

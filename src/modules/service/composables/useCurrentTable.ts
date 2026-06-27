import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useTablesStore } from '@/shared/stores/venueStores';
import { useTtlFreshness } from '@/shared/stores/useTtlFreshness';
import type { Table } from '@/shared/types';

export function useCurrentTable() {
  const route = useRoute();
  const tablesStore = useTablesStore();
  const { invalidateAndRefresh } = useTtlFreshness([tablesStore]);

  const tableId = computed(() => {
    const raw = route.params['id'];
    return Array.isArray(raw) ? (raw[0] ?? '') : (raw ?? '');
  });

  const table = computed<Table | null>(() => tablesStore.byId(tableId.value) ?? null);
  const loading = computed(() => tablesStore.loading);
  const error = computed(() => tablesStore.error ?? '');

  return { table, tableId, loading, error, reload: () => invalidateAndRefresh(tablesStore) };
}

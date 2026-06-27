import { computed } from 'vue';
import {
  createArea as apiCreateArea,
  updateArea as apiUpdateArea,
  deleteArea as apiDeleteArea,
  type AreaInput,
} from '@/shared/api/venue';
import { useAreasStore } from '@/shared/stores/venueStores';
import { useCategoriesStore, CATALOG_RESOURCE } from '@/shared/stores/catalogStores';
import { useTtlFreshness } from '@/shared/stores/useTtlFreshness';
import { useCatalogFreshness } from '@/shared/stores/useCatalogFreshness';
import type { AreaRow } from '../domain';

export function useAreas() {
  const areasStore = useAreasStore();
  const categoriesStore = useCategoriesStore();
  const { invalidateAndRefresh } = useTtlFreshness([areasStore]);
  useCatalogFreshness([CATALOG_RESOURCE.CATEGORIES]);

  const loading = computed(() => areasStore.loading || categoriesStore.loading);
  const error = computed(() => areasStore.error ?? categoriesStore.error ?? '');

  const areaRows = computed<AreaRow[]>(() =>
    areasStore.items.map((area) => ({
      ...area,
      categoryCount: categoriesStore.items.filter((category) => category.areaId === area.id).length,
    })),
  );

  async function createArea(input: AreaInput) {
    await apiCreateArea(input);
    await invalidateAndRefresh(areasStore);
  }

  async function updateArea(id: string, input: Partial<AreaInput>) {
    await apiUpdateArea(id, input);
    await invalidateAndRefresh(areasStore);
  }

  async function removeArea(id: string) {
    await apiDeleteArea(id);
    await invalidateAndRefresh(areasStore);
  }

  return {
    areas: areaRows,
    loading,
    error,
    reload: () => invalidateAndRefresh(areasStore),
    createArea,
    updateArea,
    removeArea,
  };
}

import { computed } from 'vue';
import {
  createCategory as apiCreateCategory,
  updateCategory as apiUpdateCategory,
  deleteCategory as apiDeleteCategory,
  type CategoryInput,
} from '@/shared/api/catalog';
import { createArea as apiCreateArea } from '@/shared/api/venue';
import {
  useCategoriesStore,
  useProductsStore,
  CATALOG_RESOURCE,
} from '@/shared/stores/catalogStores';
import { useAreasStore } from '@/shared/stores/venueStores';
import { useCatalogFreshness } from '@/shared/stores/useCatalogFreshness';
import { useTtlFreshness } from '@/shared/stores/useTtlFreshness';
import type { Area } from '@/shared/types';
import { EMPTY_VALUE } from '@/shared/constants/display';
import type { CategoryRow } from '../domain';

export function useCategories() {
  const categoriesStore = useCategoriesStore();
  const productsStore = useProductsStore();
  const areasStore = useAreasStore();
  const { invalidateAndRefresh } = useCatalogFreshness([
    CATALOG_RESOURCE.CATEGORIES,
    CATALOG_RESOURCE.PRODUCTS,
  ]);
  const { invalidateAndRefresh: refreshAreas } = useTtlFreshness([areasStore]);

  const loading = computed(
    () => categoriesStore.loading || productsStore.loading || areasStore.loading,
  );
  const error = computed(
    () => categoriesStore.error ?? productsStore.error ?? areasStore.error ?? '',
  );
  const areas = computed<Area[]>(() => areasStore.items);

  const categoryRows = computed<CategoryRow[]>(() =>
    categoriesStore.items.map((category) => ({
      ...category,
      productCount: productsStore.items.filter((product) => product.categoryId === category.id)
        .length,
      areaName: category.areaId
        ? (areasStore.byId(category.areaId)?.name ?? EMPTY_VALUE)
        : EMPTY_VALUE,
    })),
  );

  async function createArea(input: { name: string }) {
    const created = await apiCreateArea(input);
    await refreshAreas(areasStore);
    return created;
  }

  async function createCategory(input: CategoryInput) {
    await apiCreateCategory(input);
    await invalidateAndRefresh(CATALOG_RESOURCE.CATEGORIES);
  }

  async function updateCategory(id: string, input: Partial<CategoryInput>) {
    await apiUpdateCategory(id, input);
    await invalidateAndRefresh(CATALOG_RESOURCE.CATEGORIES);
  }

  async function removeCategory(id: string) {
    await apiDeleteCategory(id);
    await invalidateAndRefresh(CATALOG_RESOURCE.CATEGORIES);
  }

  return {
    categories: categoryRows,
    areas,
    loading,
    error,
    reload: () => invalidateAndRefresh(CATALOG_RESOURCE.CATEGORIES, CATALOG_RESOURCE.PRODUCTS),
    createArea,
    createCategory,
    updateCategory,
    removeCategory,
  };
}

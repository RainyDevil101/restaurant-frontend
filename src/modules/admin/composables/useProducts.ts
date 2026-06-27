import { computed } from 'vue';
import {
  createProduct as apiCreateProduct,
  updateProduct as apiUpdateProduct,
  deleteProduct as apiDeleteProduct,
  toggleProductAvailability as apiToggleAvailability,
  createCategory as apiCreateCategory,
  type ProductInput,
  type CategoryInput,
} from '@/shared/api/catalog';
import { createArea as apiCreateArea } from '@/shared/api/venue';
import {
  useProductsStore,
  useCategoriesStore,
  CATALOG_RESOURCE,
} from '@/shared/stores/catalogStores';
import { useAreasStore } from '@/shared/stores/venueStores';
import { useCatalogFreshness } from '@/shared/stores/useCatalogFreshness';
import { useTtlFreshness } from '@/shared/stores/useTtlFreshness';
import type { Area, Category } from '@/shared/types';
import { EMPTY_VALUE } from '@/shared/constants/display';
import type { ProductRow } from '../domain';

export function useProducts() {
  const productsStore = useProductsStore();
  const categoriesStore = useCategoriesStore();
  const areasStore = useAreasStore();
  const { invalidateAndRefresh } = useCatalogFreshness([
    CATALOG_RESOURCE.PRODUCTS,
    CATALOG_RESOURCE.CATEGORIES,
  ]);
  const { invalidateAndRefresh: refreshAreas } = useTtlFreshness([areasStore]);

  const loading = computed(
    () => productsStore.loading || categoriesStore.loading || areasStore.loading,
  );
  const error = computed(
    () => productsStore.error ?? categoriesStore.error ?? areasStore.error ?? '',
  );
  const categories = computed<Category[]>(() => categoriesStore.items);
  const areas = computed<Area[]>(() => areasStore.items);

  const productRows = computed<ProductRow[]>(() =>
    productsStore.items.map((product) => ({
      ...product,
      categoryName: categoriesStore.byId(product.categoryId)?.name ?? EMPTY_VALUE,
    })),
  );

  async function createProduct(input: ProductInput) {
    await apiCreateProduct(input);
    await invalidateAndRefresh(CATALOG_RESOURCE.PRODUCTS);
  }

  async function updateProduct(id: string, input: Partial<ProductInput>) {
    await apiUpdateProduct(id, input);
    await invalidateAndRefresh(CATALOG_RESOURCE.PRODUCTS);
  }

  async function removeProduct(id: string) {
    await apiDeleteProduct(id);
    await invalidateAndRefresh(CATALOG_RESOURCE.PRODUCTS);
  }

  async function toggleAvailability(id: string) {
    await apiToggleAvailability(id);
    await invalidateAndRefresh(CATALOG_RESOURCE.PRODUCTS);
  }

  async function createArea(input: { name: string }) {
    const created = await apiCreateArea(input);
    await refreshAreas(areasStore);
    return created;
  }

  async function createCategory(input: CategoryInput) {
    const created = await apiCreateCategory(input);
    await invalidateAndRefresh(CATALOG_RESOURCE.CATEGORIES);
    return created;
  }

  return {
    products: productRows,
    categories,
    areas,
    loading,
    error,
    reload: () => invalidateAndRefresh(CATALOG_RESOURCE.PRODUCTS, CATALOG_RESOURCE.CATEGORIES),
    createProduct,
    updateProduct,
    removeProduct,
    toggleAvailability,
    createArea,
    createCategory,
  };
}

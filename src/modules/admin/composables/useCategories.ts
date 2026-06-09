import { computed } from 'vue'
import {
  createCategory as apiCreateCategory,
  updateCategory as apiUpdateCategory,
  deleteCategory as apiDeleteCategory,
  type CategoryInput,
} from '@/shared/api/catalog'
import { createArea as apiCreateArea } from '@/shared/api/venue'
import { useCategoriesStore, useProductsStore } from '@/shared/stores/catalogStores'
import { useAreasStore } from '@/shared/stores/venueStores'
import { useCatalogFreshness } from '@/shared/stores/useCatalogFreshness'
import { useTtlFreshness } from '@/shared/stores/useTtlFreshness'
import type { Area, Category } from '@/shared/types'

export interface CategoryRow extends Category {
  productCount: number
  areaName: string
}

export function useCategories() {
  const categoriesStore = useCategoriesStore()
  const productsStore = useProductsStore()
  const areasStore = useAreasStore()
  const { invalidateAndRefresh } = useCatalogFreshness(['categories', 'products'])
  const { invalidateAndRefresh: refreshAreas } = useTtlFreshness([areasStore])

  const loading = computed(
    () => categoriesStore.loading || productsStore.loading || areasStore.loading,
  )
  const error = computed(
    () => categoriesStore.error ?? productsStore.error ?? areasStore.error ?? '',
  )
  const areas = computed<Area[]>(() => areasStore.items)

  const categoryRows = computed<CategoryRow[]>(() =>
    categoriesStore.items.map((category) => ({
      ...category,
      productCount: productsStore.items.filter((product) => product.categoryId === category.id)
        .length,
      areaName: category.areaId ? (areasStore.byId(category.areaId)?.name ?? '—') : '—',
    })),
  )

  async function createArea(input: { name: string }) {
    const created = await apiCreateArea(input)
    await refreshAreas(areasStore)
    return created
  }

  async function createCategory(input: CategoryInput) {
    await apiCreateCategory(input)
    await invalidateAndRefresh('categories')
  }

  async function updateCategory(id: string, input: Partial<CategoryInput>) {
    await apiUpdateCategory(id, input)
    await invalidateAndRefresh('categories')
  }

  async function removeCategory(id: string) {
    await apiDeleteCategory(id)
    await invalidateAndRefresh('categories')
  }

  return {
    categories: categoryRows,
    areas,
    loading,
    error,
    reload: () => invalidateAndRefresh('categories', 'products'),
    createArea,
    createCategory,
    updateCategory,
    removeCategory,
  }
}

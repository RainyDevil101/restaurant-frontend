import { computed } from 'vue'
import {
  createCategory as apiCreateCategory,
  updateCategory as apiUpdateCategory,
  deleteCategory as apiDeleteCategory,
  type CategoryInput,
} from '@/shared/api/catalog'
import { useCategoriesStore, useProductsStore } from '@/shared/stores/catalogStores'
import { useCatalogFreshness } from '@/shared/stores/useCatalogFreshness'
import type { Category } from '@/shared/types'

export interface CategoryRow extends Category {
  productCount: number
}

export function useCategories() {
  const categoriesStore = useCategoriesStore()
  const productsStore = useProductsStore()
  const { invalidateAndRefresh } = useCatalogFreshness(['categories', 'products'])

  const loading = computed(() => categoriesStore.loading || productsStore.loading)
  const error = computed(() => categoriesStore.error ?? productsStore.error ?? '')

  const categoryRows = computed<CategoryRow[]>(() =>
    categoriesStore.items.map((category) => ({
      ...category,
      productCount: productsStore.items.filter((product) => product.categoryId === category.id)
        .length,
    })),
  )

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
    loading,
    error,
    reload: () => invalidateAndRefresh('categories', 'products'),
    createCategory,
    updateCategory,
    removeCategory,
  }
}

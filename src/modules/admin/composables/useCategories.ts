import { computed } from 'vue'
import {
  createCategory as apiCreateCategory,
  updateCategory as apiUpdateCategory,
  deleteCategory as apiDeleteCategory,
  type CategoryInput,
} from '@/shared/api/catalog'
import { useCategoriesStore, useProductsStore } from '@/shared/stores/catalogStores'
import { useCatalogFreshness } from '@/shared/stores/useCatalogFreshness'
import { useDataTable } from '@/shared/stores/useDataTable'
import { PRODUCTS_PER_PAGE } from '../constants'
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

  const table = useDataTable<CategoryRow>(categoryRows, {
    sortBy: 'name',
    pageSize: PRODUCTS_PER_PAGE,
    sortAccessors: {
      name: (row) => row.name,
      productCount: (row) => row.productCount,
    },
    searchAccessor: (row) => row.name,
  })

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
    categories: table.rows,
    search: table.search,
    loading,
    error,
    page: table.page,
    pageSize: table.pageSize,
    totalPages: table.totalPages,
    sortBy: table.sortBy,
    sortDir: table.sortDir,
    toggleSort: table.toggleSort,
    setPage: table.setPage,
    reload: () => invalidateAndRefresh('categories', 'products'),
    createCategory,
    updateCategory,
    removeCategory,
  }
}

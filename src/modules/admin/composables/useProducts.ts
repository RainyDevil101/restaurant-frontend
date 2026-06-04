import { computed } from 'vue'
import {
  createProduct as apiCreateProduct,
  updateProduct as apiUpdateProduct,
  deleteProduct as apiDeleteProduct,
  toggleProductAvailability as apiToggleAvailability,
  createCategory as apiCreateCategory,
  type ProductInput,
  type CategoryInput,
} from '@/shared/api/catalog'
import { useProductsStore, useCategoriesStore } from '@/shared/stores/catalogStores'
import { useCatalogFreshness } from '@/shared/stores/useCatalogFreshness'
import { useDataTable } from '@/shared/stores/useDataTable'
import { PRODUCTS_PER_PAGE } from '../constants'
import type { Category, Product } from '@/shared/types'

export interface ProductRow extends Product {
  categoryName: string
}

export function useProducts() {
  const productsStore = useProductsStore()
  const categoriesStore = useCategoriesStore()
  const { invalidateAndRefresh } = useCatalogFreshness(['products', 'categories'])

  const loading = computed(() => productsStore.loading || categoriesStore.loading)
  const error = computed(() => productsStore.error ?? categoriesStore.error ?? '')
  const categories = computed<Category[]>(() => categoriesStore.items)

  const productRows = computed<ProductRow[]>(() =>
    productsStore.items.map((product) => ({
      ...product,
      categoryName: categoriesStore.byId(product.categoryId)?.name ?? '—',
    })),
  )

  const table = useDataTable<ProductRow>(productRows, {
    sortBy: 'name',
    pageSize: PRODUCTS_PER_PAGE,
    sortAccessors: {
      name: (row) => row.name,
      categoryName: (row) => row.categoryName,
      price: (row) => row.price,
    },
    searchAccessor: (row) => row.name,
  })

  async function createProduct(input: ProductInput) {
    await apiCreateProduct(input)
    await invalidateAndRefresh('products')
  }

  async function updateProduct(id: string, input: Partial<ProductInput>) {
    await apiUpdateProduct(id, input)
    await invalidateAndRefresh('products')
  }

  async function removeProduct(id: string) {
    await apiDeleteProduct(id)
    await invalidateAndRefresh('products')
  }

  async function toggleAvailability(id: string) {
    await apiToggleAvailability(id)
    await invalidateAndRefresh('products')
  }

  async function createCategory(input: CategoryInput) {
    const created = await apiCreateCategory(input)
    await invalidateAndRefresh('categories')
    return created
  }

  return {
    products: table.rows,
    categories,
    search: table.search,
    loading,
    error,
    page: table.page,
    pageSize: table.pageSize,
    totalItems: table.totalItems,
    totalPages: table.totalPages,
    fillerCount: table.fillerCount,
    sortBy: table.sortBy,
    sortDir: table.sortDir,
    toggleSort: table.toggleSort,
    setPage: table.setPage,
    reload: () => invalidateAndRefresh('products', 'categories'),
    createProduct,
    updateProduct,
    removeProduct,
    toggleAvailability,
    createCategory,
  }
}

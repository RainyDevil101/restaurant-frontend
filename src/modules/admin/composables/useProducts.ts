import { ref, computed, onMounted } from 'vue'
import {
  listProducts,
  listCategories,
  createProduct as apiCreateProduct,
  updateProduct as apiUpdateProduct,
  deleteProduct as apiDeleteProduct,
  toggleProductAvailability as apiToggleAvailability,
  createCategory as apiCreateCategory,
  type ProductInput,
  type CategoryInput,
} from '@/shared/api/catalog'
import { ApiRequestError } from '@/shared/api/client'
import type { Category, Product } from '@/shared/types'

export function useProducts() {
  const search = ref('')
  const items = ref<Product[]>([])
  const categories = ref<Category[]>([])
  const loading = ref(false)
  const error = ref('')

  async function load() {
    loading.value = true
    error.value = ''
    try {
      const [products, cats] = await Promise.all([listProducts(), listCategories()])
      items.value = products
      categories.value = cats
    } catch (err) {
      error.value =
        err instanceof ApiRequestError ? err.message : 'No se pudieron cargar los productos.'
    } finally {
      loading.value = false
    }
  }

  onMounted(load)

  const products = computed(() => {
    const q = search.value.trim().toLowerCase()
    return items.value
      .map((p) => ({
        ...p,
        categoryName: categories.value.find((c) => c.id === p.categoryId)?.name ?? '—',
      }))
      .filter((p) => !q || p.name.toLowerCase().includes(q))
  })

  async function createProduct(input: ProductInput) {
    await apiCreateProduct(input)
    await load()
  }

  async function updateProduct(id: string, input: Partial<ProductInput>) {
    await apiUpdateProduct(id, input)
    await load()
  }

  async function removeProduct(id: string) {
    await apiDeleteProduct(id)
    await load()
  }

  async function toggleAvailability(id: string) {
    await apiToggleAvailability(id)
    await load()
  }

  async function createCategory(input: CategoryInput) {
    const created = await apiCreateCategory(input)
    await load()
    return created
  }

  return {
    products,
    categories,
    search,
    loading,
    error,
    reload: load,
    createProduct,
    updateProduct,
    removeProduct,
    toggleAvailability,
    createCategory,
  }
}

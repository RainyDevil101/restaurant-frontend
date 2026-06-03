import { ref, computed, onMounted } from 'vue'
import {
  listCategories,
  listProducts,
  createCategory as apiCreateCategory,
  updateCategory as apiUpdateCategory,
  deleteCategory as apiDeleteCategory,
  type CategoryInput,
} from '@/shared/api/catalog'
import { ApiRequestError } from '@/shared/api/client'
import type { Category, Product } from '@/shared/types'

export function useCategories() {
  const search = ref('')
  const items = ref<Category[]>([])
  const products = ref<Product[]>([])
  const loading = ref(false)
  const error = ref('')

  async function load() {
    loading.value = true
    error.value = ''
    try {
      const [cats, prods] = await Promise.all([listCategories(), listProducts()])
      items.value = cats
      products.value = prods
    } catch (err) {
      error.value =
        err instanceof ApiRequestError ? err.message : 'No se pudieron cargar las categorías.'
    } finally {
      loading.value = false
    }
  }

  onMounted(load)

  const categories = computed(() => {
    const q = search.value.trim().toLowerCase()
    return items.value
      .map((c) => ({
        ...c,
        productCount: products.value.filter((p) => p.categoryId === c.id).length,
      }))
      .filter((c) => !q || c.name.toLowerCase().includes(q))
  })

  async function createCategory(input: CategoryInput) {
    await apiCreateCategory(input)
    await load()
  }

  async function updateCategory(id: string, input: Partial<CategoryInput>) {
    await apiUpdateCategory(id, input)
    await load()
  }

  async function removeCategory(id: string) {
    await apiDeleteCategory(id)
    await load()
  }

  return {
    categories,
    search,
    loading,
    error,
    reload: load,
    createCategory,
    updateCategory,
    removeCategory,
  }
}

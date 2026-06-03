import { ref, computed, onMounted } from 'vue'
import {
  listMenus,
  listProducts,
  createMenu as apiCreateMenu,
  updateMenu as apiUpdateMenu,
  deleteMenu as apiDeleteMenu,
  toggleMenuActive as apiToggleActive,
  type MenuInput,
} from '@/shared/api/catalog'
import { ApiRequestError } from '@/shared/api/client'
import type { Menu, Product } from '@/shared/types'

export function useMenus() {
  const search = ref('')
  const items = ref<Menu[]>([])
  const products = ref<Product[]>([])
  const loading = ref(false)
  const error = ref('')

  async function load() {
    loading.value = true
    error.value = ''
    try {
      const [mns, prods] = await Promise.all([listMenus(), listProducts()])
      items.value = mns
      products.value = prods
    } catch (err) {
      error.value = err instanceof ApiRequestError ? err.message : 'No se pudieron cargar los menús.'
    } finally {
      loading.value = false
    }
  }

  onMounted(load)

  const menus = computed(() => {
    const q = search.value.trim().toLowerCase()
    return items.value
      .map((m) => ({ ...m, productCount: m.productIds.length }))
      .filter((m) => !q || m.name.toLowerCase().includes(q))
  })

  async function createMenu(input: MenuInput) {
    await apiCreateMenu(input)
    await load()
  }

  async function updateMenu(id: string, input: Partial<MenuInput>) {
    await apiUpdateMenu(id, input)
    await load()
  }

  async function removeMenu(id: string) {
    await apiDeleteMenu(id)
    await load()
  }

  async function toggleActive(id: string) {
    await apiToggleActive(id)
    await load()
  }

  return {
    menus,
    products,
    search,
    loading,
    error,
    reload: load,
    createMenu,
    updateMenu,
    removeMenu,
    toggleActive,
  }
}

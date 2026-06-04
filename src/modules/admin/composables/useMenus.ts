import { computed } from 'vue'
import {
  createMenu as apiCreateMenu,
  updateMenu as apiUpdateMenu,
  deleteMenu as apiDeleteMenu,
  toggleMenuActive as apiToggleActive,
  type MenuInput,
} from '@/shared/api/catalog'
import { useMenusStore, useProductsStore } from '@/shared/stores/catalogStores'
import { useCatalogFreshness } from '@/shared/stores/useCatalogFreshness'
import { useDataTable } from '@/shared/stores/useDataTable'
import { PRODUCTS_PER_PAGE } from '../constants'
import type { Menu, Product } from '@/shared/types'

export interface MenuRow extends Menu {
  productCount: number
}

export function useMenus() {
  const menusStore = useMenusStore()
  const productsStore = useProductsStore()
  const { invalidateAndRefresh } = useCatalogFreshness(['menus', 'products'])

  const loading = computed(() => menusStore.loading || productsStore.loading)
  const error = computed(() => menusStore.error ?? productsStore.error ?? '')
  const products = computed<Product[]>(() => productsStore.items)

  const menuRows = computed<MenuRow[]>(() =>
    menusStore.items.map((menu) => ({ ...menu, productCount: menu.productIds.length })),
  )

  const table = useDataTable<MenuRow>(menuRows, {
    sortBy: 'name',
    pageSize: PRODUCTS_PER_PAGE,
    sortAccessors: {
      name: (row) => row.name,
      price: (row) => row.price,
      productCount: (row) => row.productCount,
      active: (row) => (row.active ? 1 : 0),
    },
    searchAccessor: (row) => row.name,
  })

  async function createMenu(input: MenuInput) {
    await apiCreateMenu(input)
    await invalidateAndRefresh('menus')
  }

  async function updateMenu(id: string, input: Partial<MenuInput>) {
    await apiUpdateMenu(id, input)
    await invalidateAndRefresh('menus')
  }

  async function removeMenu(id: string) {
    await apiDeleteMenu(id)
    await invalidateAndRefresh('menus')
  }

  async function toggleActive(id: string) {
    await apiToggleActive(id)
    await invalidateAndRefresh('menus')
  }

  return {
    menus: table.rows,
    products,
    search: table.search,
    loading,
    error,
    page: table.page,
    pageSize: table.pageSize,
    totalPages: table.totalPages,
    fillerCount: table.fillerCount,
    sortBy: table.sortBy,
    sortDir: table.sortDir,
    toggleSort: table.toggleSort,
    setPage: table.setPage,
    reload: () => invalidateAndRefresh('menus', 'products'),
    createMenu,
    updateMenu,
    removeMenu,
    toggleActive,
  }
}

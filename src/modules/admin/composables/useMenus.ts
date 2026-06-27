import { computed } from 'vue';
import {
  createMenu as apiCreateMenu,
  updateMenu as apiUpdateMenu,
  deleteMenu as apiDeleteMenu,
  toggleMenuActive as apiToggleActive,
  type MenuInput,
} from '@/shared/api/catalog';
import { useMenusStore, useProductsStore, CATALOG_RESOURCE } from '@/shared/stores/catalogStores';
import { useCatalogFreshness } from '@/shared/stores/useCatalogFreshness';
import type { Product } from '@/shared/types';
import type { MenuRow } from '../domain';

export function useMenus() {
  const menusStore = useMenusStore();
  const productsStore = useProductsStore();
  const { invalidateAndRefresh } = useCatalogFreshness([
    CATALOG_RESOURCE.MENUS,
    CATALOG_RESOURCE.PRODUCTS,
  ]);

  const loading = computed(() => menusStore.loading || productsStore.loading);
  const error = computed(() => menusStore.error ?? productsStore.error ?? '');
  const products = computed<Product[]>(() => productsStore.items);

  const menuRows = computed<MenuRow[]>(() =>
    menusStore.items.map((menu) => ({ ...menu, productCount: menu.items.length })),
  );

  async function createMenu(input: MenuInput) {
    await apiCreateMenu(input);
    await invalidateAndRefresh(CATALOG_RESOURCE.MENUS);
  }

  async function updateMenu(id: string, input: Partial<MenuInput>) {
    await apiUpdateMenu(id, input);
    await invalidateAndRefresh(CATALOG_RESOURCE.MENUS);
  }

  async function removeMenu(id: string) {
    await apiDeleteMenu(id);
    await invalidateAndRefresh(CATALOG_RESOURCE.MENUS);
  }

  async function toggleActive(id: string) {
    await apiToggleActive(id);
    await invalidateAndRefresh(CATALOG_RESOURCE.MENUS);
  }

  return {
    menus: menuRows,
    products,
    loading,
    error,
    reload: () => invalidateAndRefresh(CATALOG_RESOURCE.MENUS, CATALOG_RESOURCE.PRODUCTS),
    createMenu,
    updateMenu,
    removeMenu,
    toggleActive,
  };
}

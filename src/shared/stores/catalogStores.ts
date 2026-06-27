import { defineStore } from 'pinia';
import { listProducts, listCategories, listMenus } from '@/shared/api/catalog';
import type { CatalogStampDto } from '@/shared/api/catalog';
import { createResourceStore } from './createResourceStore';
import { STORE_MESSAGES } from './messages';

export type CatalogResourceKey = keyof CatalogStampDto;

export const CATALOG_RESOURCE = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  MENUS: 'menus',
} as const satisfies Record<string, CatalogResourceKey>;

export const CATALOG_RESOURCE_KEYS: readonly CatalogResourceKey[] = Object.values(CATALOG_RESOURCE);

export const useProductsStore = defineStore(CATALOG_RESOURCE.PRODUCTS, () =>
  createResourceStore(listProducts, {
    errorMessage: STORE_MESSAGES.LOAD_PRODUCTS_ERROR,
  }),
);

export const useCategoriesStore = defineStore(CATALOG_RESOURCE.CATEGORIES, () =>
  createResourceStore(listCategories, {
    errorMessage: STORE_MESSAGES.LOAD_CATEGORIES_ERROR,
  }),
);

export const useMenusStore = defineStore(CATALOG_RESOURCE.MENUS, () =>
  createResourceStore(listMenus, {
    errorMessage: STORE_MESSAGES.LOAD_MENUS_ERROR,
  }),
);

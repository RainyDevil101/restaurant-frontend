import { defineStore } from 'pinia';
import { listProducts, listCategories, listMenus } from '@/shared/api/catalog';
import { createResourceStore } from './createResourceStore';

export const useProductsStore = defineStore('products', () =>
  createResourceStore(listProducts, {
    errorMessage: 'No se pudieron cargar los productos.',
  }),
);

export const useCategoriesStore = defineStore('categories', () =>
  createResourceStore(listCategories, {
    errorMessage: 'No se pudieron cargar las categorías.',
  }),
);

export const useMenusStore = defineStore('menus', () =>
  createResourceStore(listMenus, {
    errorMessage: 'No se pudieron cargar los menús.',
  }),
);

import { api } from './client';
import { ENDPOINTS } from './endpoints';
import type { Category, Product, Menu } from '@/shared/types';

export type ProductInput = Omit<Product, 'id' | 'available'>;
export type MenuInput = Omit<Menu, 'id' | 'active'>;
export type CategoryInput = Omit<Category, 'id'>;

export interface ResourceStamp {
  count: number;
  lastModified: string | null;
}

export interface CatalogStampDto {
  products: ResourceStamp;
  categories: ResourceStamp;
  menus: ResourceStamp;
}

export function getCatalogStamp(): Promise<CatalogStampDto> {
  return api.get<CatalogStampDto>(ENDPOINTS.catalog.stamp);
}

export function listProducts(): Promise<Product[]> {
  return api.get<Product[]>(ENDPOINTS.products.root);
}

export function createProduct(input: ProductInput): Promise<Product> {
  return api.post<Product>(ENDPOINTS.products.root, input);
}

export function updateProduct(id: string, input: Partial<ProductInput>): Promise<Product> {
  return api.patch<Product>(ENDPOINTS.products.byId(id), input);
}

export function deleteProduct(id: string): Promise<void> {
  return api.delete<void>(ENDPOINTS.products.byId(id));
}

export function toggleProductAvailability(id: string): Promise<Product> {
  return api.patch<Product>(ENDPOINTS.products.availability(id));
}

export function listCategories(): Promise<Category[]> {
  return api.get<Category[]>(ENDPOINTS.categories.root);
}

export function createCategory(input: CategoryInput): Promise<Category> {
  return api.post<Category>(ENDPOINTS.categories.root, input);
}

export function updateCategory(id: string, input: Partial<CategoryInput>): Promise<Category> {
  return api.patch<Category>(ENDPOINTS.categories.byId(id), input);
}

export function deleteCategory(id: string): Promise<void> {
  return api.delete<void>(ENDPOINTS.categories.byId(id));
}

export function listMenus(): Promise<Menu[]> {
  return api.get<Menu[]>(ENDPOINTS.menus.root);
}

export function createMenu(input: MenuInput): Promise<Menu> {
  return api.post<Menu>(ENDPOINTS.menus.root, input);
}

export function updateMenu(id: string, input: Partial<MenuInput>): Promise<Menu> {
  return api.patch<Menu>(ENDPOINTS.menus.byId(id), input);
}

export function deleteMenu(id: string): Promise<void> {
  return api.delete<void>(ENDPOINTS.menus.byId(id));
}

export function toggleMenuActive(id: string): Promise<Menu> {
  return api.patch<Menu>(ENDPOINTS.menus.active(id));
}

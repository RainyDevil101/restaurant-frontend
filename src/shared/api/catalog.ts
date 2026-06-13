import { api } from './client';
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
  return api.get<CatalogStampDto>('/catalog/stamp');
}

export function listProducts(): Promise<Product[]> {
  return api.get<Product[]>('/products');
}

export function createProduct(input: ProductInput): Promise<Product> {
  return api.post<Product>('/products', input);
}

export function updateProduct(id: string, input: Partial<ProductInput>): Promise<Product> {
  return api.patch<Product>(`/products/${id}`, input);
}

export function deleteProduct(id: string): Promise<void> {
  return api.delete<void>(`/products/${id}`);
}

export function toggleProductAvailability(id: string): Promise<Product> {
  return api.patch<Product>(`/products/${id}/availability`);
}

export function listCategories(): Promise<Category[]> {
  return api.get<Category[]>('/categories');
}

export function createCategory(input: CategoryInput): Promise<Category> {
  return api.post<Category>('/categories', input);
}

export function updateCategory(id: string, input: Partial<CategoryInput>): Promise<Category> {
  return api.patch<Category>(`/categories/${id}`, input);
}

export function deleteCategory(id: string): Promise<void> {
  return api.delete<void>(`/categories/${id}`);
}

export function listMenus(): Promise<Menu[]> {
  return api.get<Menu[]>('/menus');
}

export function createMenu(input: MenuInput): Promise<Menu> {
  return api.post<Menu>('/menus', input);
}

export function updateMenu(id: string, input: Partial<MenuInput>): Promise<Menu> {
  return api.patch<Menu>(`/menus/${id}`, input);
}

export function deleteMenu(id: string): Promise<void> {
  return api.delete<void>(`/menus/${id}`);
}

export function toggleMenuActive(id: string): Promise<Menu> {
  return api.patch<Menu>(`/menus/${id}/active`);
}

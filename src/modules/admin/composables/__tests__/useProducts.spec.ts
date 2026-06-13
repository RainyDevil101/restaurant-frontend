import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/shared/api/catalog', () => ({
  getCatalogStamp: vi.fn<typeof import('@/shared/api/catalog').getCatalogStamp>(),
  listProducts: vi.fn<typeof import('@/shared/api/catalog').listProducts>(),
  listCategories: vi.fn<typeof import('@/shared/api/catalog').listCategories>(),
  listMenus: vi.fn<typeof import('@/shared/api/catalog').listMenus>(),
  createProduct: vi.fn<typeof import('@/shared/api/catalog').createProduct>(),
  updateProduct: vi.fn<typeof import('@/shared/api/catalog').updateProduct>(),
  deleteProduct: vi.fn<typeof import('@/shared/api/catalog').deleteProduct>(),
  toggleProductAvailability: vi.fn<typeof import('@/shared/api/catalog').toggleProductAvailability>(),
  createCategory: vi.fn<typeof import('@/shared/api/catalog').createCategory>(),
}))

vi.mock('@/shared/api/venue', () => ({
  listAreas: vi.fn<typeof import('@/shared/api/venue').listAreas>(),
  listTables: vi.fn<typeof import('@/shared/api/venue').listTables>(),
  createArea: vi.fn<typeof import('@/shared/api/venue').createArea>(),
}))

import {
  listProducts,
  listCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductAvailability,
  createCategory,
} from '@/shared/api/catalog'
import { listAreas, createArea } from '@/shared/api/venue'
import { useProducts } from '../useProducts'

const product = {
  id: 'p1',
  name: 'Tacos',
  price: 90,
  categoryId: 'c1',
  available: true,
}

const category = { id: 'c1', name: 'Comida', areaId: 'a1' }
const area = { id: 'a1', name: 'Cocina' }

function withSetup(): ReturnType<typeof useProducts> {
  let result!: ReturnType<typeof useProducts>
  mount(
    defineComponent({
      setup() {
        result = useProducts()
        return () => h('div')
      },
    }),
  )
  return result
}

describe('useProducts', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.mocked(listProducts).mockResolvedValue([product])
    vi.mocked(listCategories).mockResolvedValue([category])
    vi.mocked(listAreas).mockResolvedValue([area])
    vi.mocked(createProduct).mockResolvedValue(product)
    vi.mocked(updateProduct).mockResolvedValue(product)
    vi.mocked(deleteProduct).mockResolvedValue(undefined)
    vi.mocked(toggleProductAvailability).mockResolvedValue(product)
    vi.mocked(createCategory).mockResolvedValue(category)
    vi.mocked(createArea).mockResolvedValue(area)
  })

  it('loads products on mount and joins the category name', async () => {
    const { products, loading } = withSetup()
    await flushPromises()
    expect(listProducts).toHaveBeenCalled()
    expect(products.value).toHaveLength(1)
    expect(products.value[0]?.categoryName).toBe('Comida')
    expect(loading.value).toBe(false)
  })

  it('falls back to a dash when the category is unknown', async () => {
    vi.mocked(listCategories).mockResolvedValue([])
    const { products } = withSetup()
    await flushPromises()
    expect(products.value[0]?.categoryName).toBe('—')
  })

  it('createProduct calls the API then reloads products', async () => {
    const { createProduct: create } = withSetup()
    await flushPromises()
    vi.mocked(listProducts).mockClear()
    await create({ name: 'Nuevo', price: 50, categoryId: 'c1' })
    expect(createProduct).toHaveBeenCalledWith({ name: 'Nuevo', price: 50, categoryId: 'c1' })
    expect(listProducts).toHaveBeenCalledTimes(1)
  })

  it('updateProduct calls the API then reloads products', async () => {
    const { updateProduct: update } = withSetup()
    await flushPromises()
    vi.mocked(listProducts).mockClear()
    await update('p1', { name: 'Editado' })
    expect(updateProduct).toHaveBeenCalledWith('p1', { name: 'Editado' })
    expect(listProducts).toHaveBeenCalledTimes(1)
  })

  it('removeProduct calls the API then reloads products', async () => {
    const { removeProduct } = withSetup()
    await flushPromises()
    vi.mocked(listProducts).mockClear()
    await removeProduct('p1')
    expect(deleteProduct).toHaveBeenCalledWith('p1')
    expect(listProducts).toHaveBeenCalledTimes(1)
  })

  it('toggleAvailability calls the API then reloads products', async () => {
    const { toggleAvailability } = withSetup()
    await flushPromises()
    vi.mocked(listProducts).mockClear()
    await toggleAvailability('p1')
    expect(toggleProductAvailability).toHaveBeenCalledWith('p1')
    expect(listProducts).toHaveBeenCalledTimes(1)
  })

  it('createCategory returns the created category and reloads categories', async () => {
    const { createCategory: create } = withSetup()
    await flushPromises()
    vi.mocked(listCategories).mockClear()
    const created = await create({ name: 'Bebidas', areaId: 'a1' })
    expect(createCategory).toHaveBeenCalledWith({ name: 'Bebidas', areaId: 'a1' })
    expect(created).toEqual(category)
    expect(listCategories).toHaveBeenCalledTimes(1)
  })

  it('surfaces an error on the error ref when the initial load fails', async () => {
    vi.mocked(listProducts).mockRejectedValue(new Error('boom'))
    const { error } = withSetup()
    await flushPromises()
    expect(error.value).toBe('No se pudieron cargar los productos.')
  })

  it('rejects when a mutation API call fails', async () => {
    vi.mocked(createProduct).mockRejectedValue(new Error('nope'))
    const { createProduct: create } = withSetup()
    await flushPromises()
    await expect(create({ name: 'X', price: 1, categoryId: 'c1' })).rejects.toThrow('nope')
  })
})

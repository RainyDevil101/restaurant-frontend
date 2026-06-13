import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/shared/api/catalog', () => ({
  getCatalogStamp: vi.fn<typeof import('@/shared/api/catalog').getCatalogStamp>(),
  listMenus: vi.fn<typeof import('@/shared/api/catalog').listMenus>(),
  listProducts: vi.fn<typeof import('@/shared/api/catalog').listProducts>(),
  listCategories: vi.fn<typeof import('@/shared/api/catalog').listCategories>(),
  createMenu: vi.fn<typeof import('@/shared/api/catalog').createMenu>(),
  updateMenu: vi.fn<typeof import('@/shared/api/catalog').updateMenu>(),
  deleteMenu: vi.fn<typeof import('@/shared/api/catalog').deleteMenu>(),
  toggleMenuActive: vi.fn<typeof import('@/shared/api/catalog').toggleMenuActive>(),
}))

import {
  listMenus,
  listProducts,
  createMenu,
  updateMenu,
  deleteMenu,
  toggleMenuActive,
} from '@/shared/api/catalog'
import { useMenus } from '../useMenus'

const menu = {
  id: 'm1',
  name: 'Combo',
  active: true,
  price: 150,
  items: [{ productId: 'p1', quantity: 2 }],
}

const product = { id: 'p1', name: 'Tacos', price: 90, categoryId: 'c1', available: true }

function withSetup(): ReturnType<typeof useMenus> {
  let result!: ReturnType<typeof useMenus>
  mount(
    defineComponent({
      setup() {
        result = useMenus()
        return () => h('div')
      },
    }),
  )
  return result
}

describe('useMenus', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    vi.mocked(listMenus).mockResolvedValue([menu])
    vi.mocked(listProducts).mockResolvedValue([product])
    vi.mocked(createMenu).mockResolvedValue(menu)
    vi.mocked(updateMenu).mockResolvedValue(menu)
    vi.mocked(deleteMenu).mockResolvedValue(undefined)
    vi.mocked(toggleMenuActive).mockResolvedValue(menu)
  })

  it('loads menus on mount and derives product count from items', async () => {
    const { menus, products, loading } = withSetup()
    await flushPromises()
    expect(listMenus).toHaveBeenCalled()
    expect(menus.value).toHaveLength(1)
    expect(menus.value[0]?.productCount).toBe(1)
    expect(products.value).toHaveLength(1)
    expect(loading.value).toBe(false)
  })

  it('createMenu calls the API then reloads menus', async () => {
    const { createMenu: create } = withSetup()
    await flushPromises()
    vi.mocked(listMenus).mockClear()
    await create({ name: 'Nuevo', price: 99, items: [] })
    expect(createMenu).toHaveBeenCalledWith({ name: 'Nuevo', price: 99, items: [] })
    expect(listMenus).toHaveBeenCalledTimes(1)
  })

  it('updateMenu calls the API then reloads menus', async () => {
    const { updateMenu: update } = withSetup()
    await flushPromises()
    vi.mocked(listMenus).mockClear()
    await update('m1', { name: 'Editado' })
    expect(updateMenu).toHaveBeenCalledWith('m1', { name: 'Editado' })
    expect(listMenus).toHaveBeenCalledTimes(1)
  })

  it('removeMenu calls the API then reloads menus', async () => {
    const { removeMenu } = withSetup()
    await flushPromises()
    vi.mocked(listMenus).mockClear()
    await removeMenu('m1')
    expect(deleteMenu).toHaveBeenCalledWith('m1')
    expect(listMenus).toHaveBeenCalledTimes(1)
  })

  it('toggleActive calls the API then reloads menus', async () => {
    const { toggleActive } = withSetup()
    await flushPromises()
    vi.mocked(listMenus).mockClear()
    await toggleActive('m1')
    expect(toggleMenuActive).toHaveBeenCalledWith('m1')
    expect(listMenus).toHaveBeenCalledTimes(1)
  })

  it('surfaces an error on the error ref when the initial load fails', async () => {
    vi.mocked(listMenus).mockRejectedValue(new Error('boom'))
    const { error } = withSetup()
    await flushPromises()
    expect(error.value).toBe('No se pudieron cargar los menús.')
  })

  it('rejects when a mutation API call fails', async () => {
    vi.mocked(deleteMenu).mockRejectedValue(new Error('nope'))
    const { removeMenu } = withSetup()
    await flushPromises()
    await expect(removeMenu('m1')).rejects.toThrow('nope')
  })
})

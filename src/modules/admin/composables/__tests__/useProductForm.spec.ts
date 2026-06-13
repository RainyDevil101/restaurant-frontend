import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, ref } from 'vue'
import type { Ref } from 'vue'
import type { Area, Category, Product } from '@/shared/types'
import type { ProductInput } from '@/shared/api/catalog'

vi.mock('@/shared/toast', () => ({
  toast: {
    success: vi.fn<typeof import('@/shared/toast').toast.success>(),
    error: vi.fn<typeof import('@/shared/toast').toast.error>(),
    info: vi.fn<typeof import('@/shared/toast').toast.info>(),
  },
}))

import { useProductForm } from '../useProductForm'
import { ADMIN_LABELS, PRODUCT_PRICE_MAX } from '../../constants'

interface Deps {
  categories: Ref<Category[]>
  areas: Ref<Area[]>
  createProduct: ReturnType<typeof vi.fn<(input: ProductInput) => Promise<void>>>
  updateProduct: ReturnType<typeof vi.fn<(id: string, input: Partial<ProductInput>) => Promise<void>>>
  createArea: ReturnType<typeof vi.fn<(input: { name: string }) => Promise<{ id: string }>>>
  createCategory: ReturnType<
    typeof vi.fn<(input: { name: string; areaId: string }) => Promise<{ id: string }>>
  >
}

function makeDeps(): Deps {
  return {
    categories: ref<Category[]>([{ id: 'c1', name: 'Comida', areaId: 'a1' }]),
    areas: ref<Area[]>([{ id: 'a1', name: 'Cocina' }]),
    createProduct: vi.fn<(input: ProductInput) => Promise<void>>().mockResolvedValue(undefined),
    updateProduct: vi
      .fn<(id: string, input: Partial<ProductInput>) => Promise<void>>()
      .mockResolvedValue(undefined),
    createArea: vi.fn<(input: { name: string }) => Promise<{ id: string }>>().mockResolvedValue({
      id: 'a9',
    }),
    createCategory: vi
      .fn<(input: { name: string; areaId: string }) => Promise<{ id: string }>>()
      .mockResolvedValue({ id: 'c9' }),
  }
}

function withSetup(deps: Deps): ReturnType<typeof useProductForm> {
  let result!: ReturnType<typeof useProductForm>
  mount(
    defineComponent({
      setup() {
        result = useProductForm(deps)
        return () => h('div')
      },
    }),
  )
  return result
}

describe('useProductForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('openCreate resets the form and defaults categoryId to the first category', () => {
    const deps = makeDeps()
    const { form, dialogOpen, editingId, openCreate } = withSetup(deps)
    openCreate()
    expect(dialogOpen.value).toBe(true)
    expect(editingId.value).toBeNull()
    expect(form.name).toBe('')
    expect(form.price).toBe(0)
    expect(form.categoryId).toBe('c1')
  })

  it('openEdit populates the form from the product and sets the editing id', () => {
    const deps = makeDeps()
    const product: Product = {
      id: 'p1',
      name: 'Tacos',
      description: 'Ricos',
      price: 90,
      categoryId: 'c1',
      available: true,
    }
    const { form, editingId, openEdit } = withSetup(deps)
    openEdit(product)
    expect(editingId.value).toBe('p1')
    expect(form.name).toBe('Tacos')
    expect(form.description).toBe('Ricos')
    expect(form.price).toBe(90)
    expect(form.categoryId).toBe('c1')
  })

  it('clampPrice rounds and clamps to the [0, max] range', () => {
    const deps = makeDeps()
    const { form, clampPrice } = withSetup(deps)
    form.price = 12.7
    clampPrice()
    expect(form.price).toBe(13)
    form.price = -5
    clampPrice()
    expect(form.price).toBe(0)
    form.price = PRODUCT_PRICE_MAX + 100
    clampPrice()
    expect(form.price).toBe(PRODUCT_PRICE_MAX)
  })

  it('save rejects an empty name without calling the API', async () => {
    const deps = makeDeps()
    const { form, formError, openCreate, save } = withSetup(deps)
    openCreate()
    form.name = '   '
    await save()
    expect(formError.value).toBe(ADMIN_LABELS.product.nameRequired)
    expect(deps.createProduct).not.toHaveBeenCalled()
  })

  it('save rejects a missing category', async () => {
    const deps = makeDeps()
    const { form, formError, openCreate, save } = withSetup(deps)
    openCreate()
    form.name = 'Tacos'
    form.categoryId = ''
    await save()
    expect(formError.value).toBe(ADMIN_LABELS.product.categoryRequired)
    expect(deps.createProduct).not.toHaveBeenCalled()
  })

  it('save rejects a non-integer or out-of-range price', async () => {
    const deps = makeDeps()
    const { form, formError, openCreate, save } = withSetup(deps)
    openCreate()
    form.name = 'Tacos'
    form.price = 12.5
    await save()
    expect(formError.value).toBe(ADMIN_LABELS.product.priceInvalid)
    expect(deps.createProduct).not.toHaveBeenCalled()
  })

  it('save creates a product with a trimmed payload when not editing', async () => {
    const deps = makeDeps()
    const { form, dialogOpen, openCreate, save } = withSetup(deps)
    openCreate()
    form.name = '  Tacos  '
    form.description = '  Ricos  '
    form.price = 90
    await save()
    expect(deps.createProduct).toHaveBeenCalledWith({
      name: 'Tacos',
      description: 'Ricos',
      price: 90,
      categoryId: 'c1',
    })
    expect(dialogOpen.value).toBe(false)
  })

  it('save omits the description when blank', async () => {
    const deps = makeDeps()
    const { form, openCreate, save } = withSetup(deps)
    openCreate()
    form.name = 'Tacos'
    form.description = '   '
    form.price = 50
    await save()
    expect(deps.createProduct).toHaveBeenCalledWith({
      name: 'Tacos',
      description: undefined,
      price: 50,
      categoryId: 'c1',
    })
  })

  it('save updates an existing product when editing', async () => {
    const deps = makeDeps()
    const product: Product = {
      id: 'p1',
      name: 'Tacos',
      price: 90,
      categoryId: 'c1',
      available: true,
    }
    const { form, openEdit, save } = withSetup(deps)
    openEdit(product)
    form.name = 'Tacos al pastor'
    await save()
    expect(deps.updateProduct).toHaveBeenCalledWith('p1', {
      name: 'Tacos al pastor',
      description: undefined,
      price: 90,
      categoryId: 'c1',
    })
    expect(deps.createProduct).not.toHaveBeenCalled()
  })

  it('inline area create sets the inline category area id via onCreated', async () => {
    const deps = makeDeps()
    const { inlineArea, inlineCat } = withSetup(deps)
    inlineArea.inputName.value = 'Barra'
    await inlineArea.submit()
    expect(deps.createArea).toHaveBeenCalledWith({ name: 'Barra' })
    expect(inlineCat.inputAreaId.value).toBe('a9')
  })

  it('inline category create sets the product categoryId via onCreated', async () => {
    const deps = makeDeps()
    const { form, inlineCat } = withSetup(deps)
    inlineCat.inputName.value = 'Postres'
    inlineCat.inputAreaId.value = 'a1'
    await inlineCat.submit()
    expect(deps.createCategory).toHaveBeenCalledWith({ name: 'Postres', areaId: 'a1' })
    expect(form.categoryId).toBe('c9')
  })
})

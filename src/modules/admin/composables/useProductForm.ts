import { reactive } from 'vue'
import type { Ref } from 'vue'
import { useAdminDialog } from './useAdminDialog'
import { useInlineCategoryCreate } from './useInlineCategoryCreate'
import { useInlineAreaCreate } from './useInlineAreaCreate'
import { ADMIN_LABELS, PRODUCT_PRICE_MAX } from '../constants'
import type { ProductInput } from '@/shared/api/catalog'
import type { Area, Category, Product } from '@/shared/types'

interface ProductFormDeps {
  categories: Ref<Category[]>
  areas: Ref<Area[]>
  createProduct: (input: ProductInput) => Promise<void>
  updateProduct: (id: string, input: Partial<ProductInput>) => Promise<void>
  createArea: (input: { name: string }) => Promise<{ id: string }>
  createCategory: (input: { name: string; areaId: string }) => Promise<{ id: string }>
}

export function useProductForm({
  categories,
  areas,
  createProduct,
  updateProduct,
  createArea,
  createCategory,
}: ProductFormDeps) {
  const dialog = useAdminDialog()
  const form = reactive({ name: '', description: '', price: 0, categoryId: '' })

  const inlineArea = useInlineAreaCreate(createArea, {
    onCreated: (id) => {
      inlineCat.inputAreaId.value = id
    },
  })

  const inlineCat = useInlineCategoryCreate(createCategory, {
    onCreated: (id) => {
      form.categoryId = id
    },
  })

  function openCreate() {
    form.name = ''
    form.description = ''
    form.price = 0
    form.categoryId = categories.value[0]?.id ?? ''
    inlineArea.inputName.value = ''
    inlineArea.error.value = ''
    inlineCat.inputName.value = ''
    inlineCat.inputAreaId.value = ''
    inlineCat.error.value = ''
    dialog.openCreate()
  }

  function openEdit(product: Product) {
    form.name = product.name
    form.description = product.description ?? ''
    form.price = product.price
    form.categoryId = product.categoryId
    inlineArea.inputName.value = ''
    inlineArea.error.value = ''
    inlineCat.inputName.value = ''
    inlineCat.inputAreaId.value = ''
    inlineCat.error.value = ''
    dialog.openEdit(product.id)
  }

  function clampPrice() {
    form.price = Math.round(form.price)
    if (form.price > PRODUCT_PRICE_MAX) form.price = PRODUCT_PRICE_MAX
    if (form.price < 0) form.price = 0
  }

  async function save() {
    if (!form.name.trim()) {
      dialog.formError.value = ADMIN_LABELS.product.nameRequired
      return
    }
    if (!form.categoryId) {
      dialog.formError.value = ADMIN_LABELS.product.categoryRequired
      return
    }
    if (!Number.isInteger(form.price) || form.price < 0 || form.price > PRODUCT_PRICE_MAX) {
      dialog.formError.value = ADMIN_LABELS.product.priceInvalid
      return
    }
    const payload: ProductInput = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      price: form.price,
      categoryId: form.categoryId,
    }
    await dialog.runSave(async () => {
      if (dialog.editingId.value) await updateProduct(dialog.editingId.value, payload)
      else await createProduct(payload)
    })
  }

  return {
    dialogOpen: dialog.dialogOpen,
    editingId: dialog.editingId,
    saving: dialog.saving,
    formError: dialog.formError,
    closeDialog: dialog.closeDialog,
    form,
    areas,
    inlineArea,
    inlineCat,
    clampPrice,
    openCreate,
    openEdit,
    save,
  }
}

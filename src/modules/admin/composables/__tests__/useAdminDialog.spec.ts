import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { ApiRequestError } from '@/shared/api/client'

vi.mock('@/shared/toast', () => ({
  toast: {
    success: vi.fn<typeof import('@/shared/toast').toast.success>(),
    error: vi.fn<typeof import('@/shared/toast').toast.error>(),
    info: vi.fn<typeof import('@/shared/toast').toast.info>(),
  },
}))

import { toast } from '@/shared/toast'
import { useAdminDialog } from '../useAdminDialog'

function withSetup(): ReturnType<typeof useAdminDialog> {
  let result!: ReturnType<typeof useAdminDialog>
  mount(
    defineComponent({
      setup() {
        result = useAdminDialog()
        return () => h('div')
      },
    }),
  )
  return result
}

describe('useAdminDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts closed with no editing id and clean state', () => {
    const { dialogOpen, editingId, saving, formError } = withSetup()
    expect(dialogOpen.value).toBe(false)
    expect(editingId.value).toBeNull()
    expect(saving.value).toBe(false)
    expect(formError.value).toBe('')
  })

  it('openCreate opens the dialog in create mode (no editing id)', () => {
    const { dialogOpen, editingId, formError, openCreate } = withSetup()
    formError.value = 'stale'
    openCreate()
    expect(dialogOpen.value).toBe(true)
    expect(editingId.value).toBeNull()
    expect(formError.value).toBe('')
  })

  it('openEdit opens the dialog in edit mode with the id', () => {
    const { dialogOpen, editingId, openEdit } = withSetup()
    openEdit('x1')
    expect(dialogOpen.value).toBe(true)
    expect(editingId.value).toBe('x1')
  })

  it('closeDialog closes the dialog', () => {
    const { dialogOpen, openCreate, closeDialog } = withSetup()
    openCreate()
    closeDialog()
    expect(dialogOpen.value).toBe(false)
  })

  it('runSave runs the fn, closes the dialog, toasts success and resets saving', async () => {
    const { dialogOpen, saving, runSave } = withSetup()
    const fn = vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
    await runSave(fn)
    expect(fn).toHaveBeenCalled()
    expect(dialogOpen.value).toBe(false)
    expect(saving.value).toBe(false)
    expect(toast.success).toHaveBeenCalledWith('Guardado correctamente')
  })

  it('runSave captures an ApiRequestError message, keeps dialog open and resets saving', async () => {
    const { dialogOpen, saving, formError, openCreate, runSave } = withSetup()
    openCreate()
    const fn = vi
      .fn<() => Promise<void>>()
      .mockRejectedValue(new ApiRequestError('Nombre duplicado', 409, null))
    await runSave(fn)
    expect(formError.value).toBe('Nombre duplicado')
    expect(dialogOpen.value).toBe(true)
    expect(saving.value).toBe(false)
    expect(toast.success).not.toHaveBeenCalled()
  })

  it('runSave falls back to a generic message for non-API errors', async () => {
    const { formError, runSave } = withSetup()
    const fn = vi.fn<() => Promise<void>>().mockRejectedValue(new Error('boom'))
    await runSave(fn)
    expect(formError.value).toBe('No se pudo guardar.')
  })
})

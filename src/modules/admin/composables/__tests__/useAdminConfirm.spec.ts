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
import { useAdminConfirm } from '../useAdminConfirm'

function withSetup(): ReturnType<typeof useAdminConfirm> {
  let result!: ReturnType<typeof useAdminConfirm>
  mount(
    defineComponent({
      setup() {
        result = useAdminConfirm()
        return () => h('div')
      },
    }),
  )
  return result
}

describe('useAdminConfirm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts closed with no deleting id and clean state', () => {
    const { confirmOpen, deletingId, deleting, deleteError } = withSetup()
    expect(confirmOpen.value).toBe(false)
    expect(deletingId.value).toBeNull()
    expect(deleting.value).toBe(false)
    expect(deleteError.value).toBe('')
  })

  it('openDelete opens the confirm with the target id', () => {
    const { confirmOpen, deletingId, deleteError, openDelete } = withSetup()
    deleteError.value = 'stale'
    openDelete('d1')
    expect(confirmOpen.value).toBe(true)
    expect(deletingId.value).toBe('d1')
    expect(deleteError.value).toBe('')
  })

  it('closeConfirm closes and clears the deleting id', () => {
    const { confirmOpen, deletingId, openDelete, closeConfirm } = withSetup()
    openDelete('d1')
    closeConfirm()
    expect(confirmOpen.value).toBe(false)
    expect(deletingId.value).toBeNull()
  })

  it('runDelete does nothing when no id is set', async () => {
    const { runDelete } = withSetup()
    const fn = vi.fn<(id: string) => Promise<void>>().mockResolvedValue(undefined)
    await runDelete(fn)
    expect(fn).not.toHaveBeenCalled()
    expect(toast.success).not.toHaveBeenCalled()
  })

  it('runDelete calls fn with the id, closes, toasts success and resets deleting', async () => {
    const { confirmOpen, deleting, openDelete, runDelete } = withSetup()
    openDelete('d1')
    const fn = vi.fn<(id: string) => Promise<void>>().mockResolvedValue(undefined)
    await runDelete(fn)
    expect(fn).toHaveBeenCalledWith('d1')
    expect(confirmOpen.value).toBe(false)
    expect(deleting.value).toBe(false)
    expect(toast.success).toHaveBeenCalledWith('Eliminado correctamente')
  })

  it('runDelete captures an ApiRequestError, keeps confirm open and resets deleting', async () => {
    const { confirmOpen, deleting, deleteError, openDelete, runDelete } = withSetup()
    openDelete('d1')
    const fn = vi
      .fn<(id: string) => Promise<void>>()
      .mockRejectedValue(new ApiRequestError('Tiene productos asociados', 409, null))
    await runDelete(fn)
    expect(deleteError.value).toBe('Tiene productos asociados')
    expect(confirmOpen.value).toBe(true)
    expect(deleting.value).toBe(false)
    expect(toast.success).not.toHaveBeenCalled()
  })

  it('runDelete falls back to a generic message for non-API errors', async () => {
    const { deleteError, openDelete, runDelete } = withSetup()
    openDelete('d1')
    const fn = vi.fn<(id: string) => Promise<void>>().mockRejectedValue(new Error('boom'))
    await runDelete(fn)
    expect(deleteError.value).toBe('No se pudo eliminar.')
  })
})

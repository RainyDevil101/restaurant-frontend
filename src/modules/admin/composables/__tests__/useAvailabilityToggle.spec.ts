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
import { useAvailabilityToggle } from '../useAvailabilityToggle'

function withSetup(
  toggleFn: (id: string) => Promise<void>,
): ReturnType<typeof useAvailabilityToggle> {
  let result!: ReturnType<typeof useAvailabilityToggle>
  mount(
    defineComponent({
      setup() {
        result = useAvailabilityToggle(toggleFn)
        return () => h('div')
      },
    }),
  )
  return result
}

describe('useAvailabilityToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('toggles successfully, toasts success and keeps no error', async () => {
    const toggleFn = vi.fn<(id: string) => Promise<void>>().mockResolvedValue(undefined)
    const { actionError, toggle } = withSetup(toggleFn)
    await toggle('p1')
    expect(toggleFn).toHaveBeenCalledWith('p1')
    expect(actionError.value).toBe('')
    expect(toast.success).toHaveBeenCalledWith('Disponibilidad actualizada')
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('captures an ApiRequestError message and toasts the error (rollback path)', async () => {
    const toggleFn = vi
      .fn<(id: string) => Promise<void>>()
      .mockRejectedValue(new ApiRequestError('No autorizado', 403, null))
    const { actionError, toggle } = withSetup(toggleFn)
    await toggle('p1')
    expect(actionError.value).toBe('No autorizado')
    expect(toast.error).toHaveBeenCalledWith('No autorizado')
    expect(toast.success).not.toHaveBeenCalled()
  })

  it('falls back to a generic message for non-API errors', async () => {
    const toggleFn = vi.fn<(id: string) => Promise<void>>().mockRejectedValue(new Error('boom'))
    const { actionError, toggle } = withSetup(toggleFn)
    await toggle('p1')
    expect(actionError.value).toBe('No se pudo actualizar.')
    expect(toast.error).toHaveBeenCalledWith('No se pudo actualizar.')
  })

  it('clears a previous error on a subsequent successful toggle', async () => {
    const toggleFn = vi.fn<(id: string) => Promise<void>>()
    toggleFn.mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce(undefined)
    const { actionError, toggle } = withSetup(toggleFn)
    await toggle('p1')
    expect(actionError.value).toBe('No se pudo actualizar.')
    await toggle('p1')
    expect(actionError.value).toBe('')
  })
})

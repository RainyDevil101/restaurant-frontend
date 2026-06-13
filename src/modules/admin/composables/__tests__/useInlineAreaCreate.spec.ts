import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { ApiRequestError } from '@/shared/api/client'
import { useInlineAreaCreate } from '../useInlineAreaCreate'

type CreateFn = (input: { name: string }) => Promise<{ id: string }>

function withSetup(
  createFn: CreateFn,
  opts?: { onCreated?: (id: string) => void },
): ReturnType<typeof useInlineAreaCreate> {
  let result!: ReturnType<typeof useInlineAreaCreate>
  mount(
    defineComponent({
      setup() {
        result = useInlineAreaCreate(createFn, opts)
        return () => h('div')
      },
    }),
  )
  return result
}

describe('useInlineAreaCreate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates the area, clears the input and notifies onCreated with the new id', async () => {
    const createFn = vi.fn<CreateFn>().mockResolvedValue({ id: 'a99' })
    const onCreated = vi.fn<(id: string) => void>()
    const { inputName, creating, error, submit } = withSetup(createFn, { onCreated })
    inputName.value = '  Cocina  '
    await submit()
    expect(createFn).toHaveBeenCalledWith({ name: 'Cocina' })
    expect(inputName.value).toBe('')
    expect(error.value).toBe('')
    expect(creating.value).toBe(false)
    expect(onCreated).toHaveBeenCalledWith('a99')
  })

  it('does nothing when the name is empty or whitespace', async () => {
    const createFn = vi.fn<CreateFn>().mockResolvedValue({ id: 'a1' })
    const { inputName, submit } = withSetup(createFn)
    inputName.value = '   '
    await submit()
    expect(createFn).not.toHaveBeenCalled()
  })

  it('captures an ApiRequestError message and resets creating', async () => {
    const createFn = vi
      .fn<CreateFn>()
      .mockRejectedValue(new ApiRequestError('Área duplicada', 409, null))
    const onCreated = vi.fn<(id: string) => void>()
    const { inputName, creating, error, submit } = withSetup(createFn, { onCreated })
    inputName.value = 'Barra'
    await submit()
    expect(error.value).toBe('Área duplicada')
    expect(creating.value).toBe(false)
    expect(onCreated).not.toHaveBeenCalled()
    expect(inputName.value).toBe('Barra')
  })

  it('falls back to a generic message for non-API errors', async () => {
    const createFn = vi.fn<CreateFn>().mockRejectedValue(new Error('boom'))
    const { inputName, error, submit } = withSetup(createFn)
    inputName.value = 'Barra'
    await submit()
    expect(error.value).toBe('No se pudo crear el área.')
  })
})

import { ref } from 'vue'
import { ApiRequestError } from '@/shared/api/client'

export function useInlineAreaCreate(
  createFn: (input: { name: string }) => Promise<{ id: string }>,
  opts?: { onCreated?: (id: string) => void },
) {
  const creating = ref(false)
  const inputName = ref('')
  const error = ref('')

  async function submit() {
    const trimmed = inputName.value.trim()
    if (!trimmed) return
    creating.value = true
    error.value = ''
    try {
      const created = await createFn({ name: trimmed })
      inputName.value = ''
      opts?.onCreated?.(created.id)
    } catch (err) {
      error.value = err instanceof ApiRequestError ? err.message : 'No se pudo crear el área.'
    } finally {
      creating.value = false
    }
  }

  return { creating, inputName, error, submit }
}

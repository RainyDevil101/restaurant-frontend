import { ref } from 'vue';
import { ApiRequestError } from '@/shared/api/client';
import { ADMIN_MESSAGES } from '../domain';

export function useInlineCategoryCreate(
  createFn: (input: { name: string; areaId: string }) => Promise<{ id: string }>,
  opts?: { onCreated?: (id: string) => void },
) {
  const creating = ref(false);
  const inputName = ref('');
  const inputAreaId = ref('');
  const error = ref('');

  async function submit() {
    const trimmed = inputName.value.trim();
    if (!trimmed) return;
    if (!inputAreaId.value) {
      error.value = ADMIN_MESSAGES.SELECT_AREA;
      return;
    }
    creating.value = true;
    error.value = '';
    try {
      const created = await createFn({ name: trimmed, areaId: inputAreaId.value });
      inputName.value = '';
      inputAreaId.value = '';
      opts?.onCreated?.(created.id);
    } catch (err) {
      error.value = err instanceof ApiRequestError ? err.message : ADMIN_MESSAGES.CREATE_ERROR;
    } finally {
      creating.value = false;
    }
  }

  return { creating, inputName, inputAreaId, error, submit };
}

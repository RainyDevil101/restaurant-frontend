import { ref } from 'vue';
import { ApiRequestError } from '@/shared/api/client';
import { toast } from '@/shared/toast';
import { ADMIN_MESSAGES } from '../domain';

export function useAvailabilityToggle(toggleFn: (id: string) => Promise<void>) {
  const actionError = ref('');

  async function toggle(id: string) {
    actionError.value = '';
    try {
      await toggleFn(id);
      toast.success(ADMIN_MESSAGES.AVAILABILITY_UPDATED);
    } catch (err) {
      actionError.value =
        err instanceof ApiRequestError ? err.message : ADMIN_MESSAGES.UPDATE_ERROR;
      toast.error(actionError.value);
    }
  }

  return { actionError, toggle };
}

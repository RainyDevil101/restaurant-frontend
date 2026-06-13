import { computed } from 'vue';
import {
  createUser as apiCreateUser,
  updateUser as apiUpdateUser,
  deactivateUser as apiDeactivateUser,
  type CreateUserInput,
  type UpdateUserInput,
} from '@/shared/api/users';
import { useUsersStore } from '@/shared/stores/usersStore';
import { useTtlFreshness } from '@/shared/stores/useTtlFreshness';
import type { User } from '@/modules/auth/store';

export function useUsers() {
  const usersStore = useUsersStore();
  const { invalidateAndRefresh } = useTtlFreshness([usersStore]);

  const loading = computed(() => usersStore.loading);
  const error = computed(() => usersStore.error ?? '');

  const userRows = computed<User[]>(() => usersStore.items);

  async function createUser(input: CreateUserInput) {
    await apiCreateUser(input);
    await invalidateAndRefresh(usersStore);
  }

  async function updateUser(id: string, input: UpdateUserInput) {
    await apiUpdateUser(id, input);
    await invalidateAndRefresh(usersStore);
  }

  async function removeUser(id: string) {
    await apiDeactivateUser(id);
    await invalidateAndRefresh(usersStore);
  }

  return {
    users: userRows,
    loading,
    error,
    reload: () => invalidateAndRefresh(usersStore),
    createUser,
    updateUser,
    removeUser,
  };
}

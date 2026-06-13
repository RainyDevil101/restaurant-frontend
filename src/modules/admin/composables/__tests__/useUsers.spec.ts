import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { setActivePinia, createPinia } from 'pinia';
import { Role } from '@/shared/types';

vi.mock('@/shared/api/users', () => ({
  listUsers: vi.fn<typeof import('@/shared/api/users').listUsers>(),
  createUser: vi.fn<typeof import('@/shared/api/users').createUser>(),
  updateUser: vi.fn<typeof import('@/shared/api/users').updateUser>(),
  deactivateUser: vi.fn<typeof import('@/shared/api/users').deactivateUser>(),
}));

import { listUsers, createUser, updateUser, deactivateUser } from '@/shared/api/users';
import { useUsers } from '../useUsers';

const user = {
  id: 'u1',
  name: 'Ana',
  email: 'ana@subito.mx',
  role: Role.MESERO,
  active: true,
  isOwner: false,
};

function withSetup(): ReturnType<typeof useUsers> {
  let result!: ReturnType<typeof useUsers>;
  mount(
    defineComponent({
      setup() {
        result = useUsers();
        return () => h('div');
      },
    }),
  );
  return result;
}

describe('useUsers', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
    vi.mocked(listUsers).mockResolvedValue([user]);
    vi.mocked(createUser).mockResolvedValue(user);
    vi.mocked(updateUser).mockResolvedValue(user);
    vi.mocked(deactivateUser).mockResolvedValue(undefined);
  });

  it('loads users on mount', async () => {
    const { users, loading } = withSetup();
    await flushPromises();
    expect(listUsers).toHaveBeenCalled();
    expect(users.value).toHaveLength(1);
    expect(users.value[0]?.name).toBe('Ana');
    expect(loading.value).toBe(false);
  });

  it('createUser calls the API then reloads users', async () => {
    const { createUser: create } = withSetup();
    await flushPromises();
    vi.mocked(listUsers).mockClear();
    const input = { name: 'Beto', email: 'beto@subito.mx', role: Role.CAJERO, credential: '1234' };
    await create(input);
    expect(createUser).toHaveBeenCalledWith(input);
    expect(listUsers).toHaveBeenCalledTimes(1);
  });

  it('updateUser calls the API then reloads users', async () => {
    const { updateUser: update } = withSetup();
    await flushPromises();
    vi.mocked(listUsers).mockClear();
    await update('u1', { name: 'Ana María' });
    expect(updateUser).toHaveBeenCalledWith('u1', { name: 'Ana María' });
    expect(listUsers).toHaveBeenCalledTimes(1);
  });

  it('removeUser deactivates via the API then reloads users', async () => {
    const { removeUser } = withSetup();
    await flushPromises();
    vi.mocked(listUsers).mockClear();
    await removeUser('u1');
    expect(deactivateUser).toHaveBeenCalledWith('u1');
    expect(listUsers).toHaveBeenCalledTimes(1);
  });

  it('surfaces an error on the error ref when the initial load fails', async () => {
    vi.mocked(listUsers).mockRejectedValue(new Error('boom'));
    const { error } = withSetup();
    await flushPromises();
    expect(error.value).toBe('No se pudieron cargar los usuarios.');
  });

  it('rejects when a mutation API call fails', async () => {
    vi.mocked(deactivateUser).mockRejectedValue(new Error('nope'));
    const { removeUser } = withSetup();
    await flushPromises();
    await expect(removeUser('u1')).rejects.toThrow('nope');
  });
});

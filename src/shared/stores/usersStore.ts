import { defineStore } from 'pinia';
import { listUsers } from '@/shared/api/users';
import { createResourceStore } from './createResourceStore';

export const useUsersStore = defineStore('users', () =>
  createResourceStore(listUsers, {
    errorMessage: 'No se pudieron cargar los usuarios.',
  }),
);

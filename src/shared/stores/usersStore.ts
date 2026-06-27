import { defineStore } from 'pinia';
import { listUsers } from '@/shared/api/users';
import { createResourceStore } from './createResourceStore';
import { STORE_MESSAGES } from './messages';

export const USERS_RESOURCE = 'users';

export const useUsersStore = defineStore(USERS_RESOURCE, () =>
  createResourceStore(listUsers, { errorMessage: STORE_MESSAGES.LOAD_USERS_ERROR }),
);

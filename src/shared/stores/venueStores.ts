import { defineStore } from 'pinia';
import { listAreas, listTables } from '@/shared/api/venue';
import { createResourceStore } from './createResourceStore';
import { STORE_MESSAGES } from './messages';

export const VENUE_RESOURCE = {
  AREAS: 'areas',
  TABLES: 'tables',
} as const;

export const useAreasStore = defineStore(VENUE_RESOURCE.AREAS, () =>
  createResourceStore(listAreas, { errorMessage: STORE_MESSAGES.LOAD_AREAS_ERROR }),
);

export const useTablesStore = defineStore(VENUE_RESOURCE.TABLES, () =>
  createResourceStore(listTables, { errorMessage: STORE_MESSAGES.LOAD_TABLES_ERROR }),
);

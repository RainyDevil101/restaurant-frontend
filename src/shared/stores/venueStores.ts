import { defineStore } from 'pinia'
import { listAreas, listTables } from '@/shared/api/venue'
import { createResourceStore } from './createResourceStore'

export const useAreasStore = defineStore('areas', () =>
  createResourceStore(listAreas, {
    errorMessage: 'No se pudieron cargar las áreas.',
  }),
)

export const useTablesStore = defineStore('tables', () =>
  createResourceStore(listTables, {
    errorMessage: 'No se pudieron cargar las mesas.',
  }),
)

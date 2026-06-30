<script lang="ts">
export interface ColumnSelectOption {
  value: string;
  label: string;
}

export type ColumnFilterConfig =
  | { type: 'text' }
  | { type: 'select'; options: ColumnSelectOption[] };

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'right';
  accessor?: (row: T) => string | number;
  filter?: ColumnFilterConfig;
}
</script>

<script setup lang="ts" generic="T extends { id: string }">
import { computed, toRef } from 'vue';
import {
  useDataTable,
  SORT_DIR,
  FILTER_MATCH,
  COLUMN_FILTER_TYPE,
  type ColumnFilter,
  type SortAccessor,
  type SortDir,
} from '@/shared/stores/useDataTable';
import AdminSearchBar from '@/modules/admin/components/AdminSearchBar.vue';
import AdminPagination from '@/modules/admin/components/AdminPagination.vue';
import { PAGE_SIZE_OPTIONS } from '@/modules/admin/constants';
import { UI_LABELS } from '@/shared/constants/ui';
import { colors } from '@/shared/styles/colors';

const SORT_GLYPH = {
  [SORT_DIR.ASC]: '▲',
  [SORT_DIR.DESC]: '▼',
} as const;

const props = withDefaults(
  defineProps<{
    items: T[];
    columns: Column<T>[];
    loading?: boolean;
    error?: string;
    pageSize?: number;
    pageSizeOptions?: readonly number[];
    defaultSort?: string;
    defaultSortDir?: SortDir;
    searchPlaceholder?: string;
    emptyText?: string;
  }>(),
  {
    loading: false,
    error: '',
    pageSize: 10,
    pageSizeOptions: () => PAGE_SIZE_OPTIONS,
    defaultSort: '',
    defaultSortDir: SORT_DIR.ASC,
    searchPlaceholder: UI_LABELS.searchPlaceholder,
    emptyText: UI_LABELS.noResults,
  },
);

function resolveValue(column: Column<T>, row: T): string | number {
  if (column.accessor) return column.accessor(row);
  const raw = (row as Record<string, unknown>)[column.key];
  if (raw === null || raw === undefined) return '';
  if (typeof raw === 'number') return raw;
  return String(raw);
}

function resolveText(column: Column<T>, row: T): string {
  return String(resolveValue(column, row));
}

const sortAccessors = computed<Record<string, SortAccessor<T>>>(() => {
  const map: Record<string, SortAccessor<T>> = {};
  for (const column of props.columns) {
    if (column.sortable) map[column.key] = (row) => resolveValue(column, row);
  }
  return map;
});

const filterableColumns = computed(() => props.columns.filter((column) => column.filter));

const columnFilters = computed<Array<ColumnFilter<T>>>(() =>
  filterableColumns.value.map((column) => ({
    key: column.key,
    accessor: (row) => resolveText(column, row),
    match:
      column.filter?.type === COLUMN_FILTER_TYPE.SELECT
        ? FILTER_MATCH.EQUALS
        : FILTER_MATCH.INCLUDES,
  })),
);

function searchAccessor(row: T): string {
  return props.columns.map((column) => resolveText(column, row)).join(' ');
}

const itemsRef = toRef(props, 'items');

const initialSort = computed(() => {
  if (props.defaultSort) return props.defaultSort;
  const firstSortable = props.columns.find((column) => column.sortable);
  return firstSortable?.key ?? props.columns[0]?.key ?? '';
});

const table = useDataTable<T>(itemsRef, {
  sortBy: initialSort.value,
  sortDir: props.defaultSortDir,
  pageSize: props.pageSize,
  sortAccessors: sortAccessors.value,
  searchAccessor,
  columnFilters: columnFilters.value,
});

const hasFilters = computed(() => filterableColumns.value.length > 0);

const hasActiveFilters = computed(() =>
  Object.values(table.filters.value).some((value) => value.trim().length > 0),
);

function clearFilters(): void {
  for (const column of filterableColumns.value) table.setFilter(column.key, '');
}

const isEmpty = computed(() => table.totalItems.value === 0);
</script>

<template>
  <div class="data-table-wrap">
    <div class="toolbar">
      <AdminSearchBar v-model="table.search.value" :placeholder="searchPlaceholder" />

      <div v-if="hasFilters" class="filter-bar">
        <label v-for="column in filterableColumns" :key="column.key" class="filter-field">
          <span class="filter-label">{{ column.label }}</span>
          <select
            v-if="column.filter && column.filter.type === COLUMN_FILTER_TYPE.SELECT"
            class="filter-control"
            :value="table.filters.value[column.key] ?? ''"
            @change="table.setFilter(column.key, ($event.target as HTMLSelectElement).value)"
          >
            <option value="">{{ UI_LABELS.all }}</option>
            <option
              v-for="option in column.filter.options"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
          <input
            v-else
            class="filter-control"
            type="text"
            :value="table.filters.value[column.key] ?? ''"
            @input="table.setFilter(column.key, ($event.target as HTMLInputElement).value)"
          />
        </label>
        <button v-if="hasActiveFilters" type="button" class="filter-clear" @click="clearFilters">
          {{ UI_LABELS.clearFilters }}
        </button>
      </div>
    </div>

    <div class="data-table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              scope="col"
              :class="{ 'col-right': column.align === 'right' }"
            >
              <button
                v-if="column.sortable"
                type="button"
                class="sort-header"
                :class="{ 'sort-header-right': column.align === 'right' }"
                @click="table.toggleSort(column.key)"
              >
                {{ column.label }}
                <span class="sort-indicator">{{
                  table.sortBy.value === column.key ? SORT_GLYPH[table.sortDir.value] : ''
                }}</span>
              </button>
              <span v-else>{{ column.label }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in table.rows.value" :key="String(row.id)" class="data-row">
            <td
              v-for="column in columns"
              :key="column.key"
              :class="{ 'col-right': column.align === 'right' }"
            >
              <slot :name="`cell-${column.key}`" :row="row">
                {{ resolveValue(column, row) }}
              </slot>
            </td>
          </tr>

          <tr
            v-for="i in isEmpty ? 0 : table.fillerCount.value"
            :key="'filler-' + i"
            class="filler-row"
            aria-hidden="true"
          >
            <td :colspan="columns.length"></td>
          </tr>

          <tr v-if="isEmpty">
            <td :colspan="columns.length" class="empty-row">
              <span v-if="loading">{{ UI_LABELS.loading }}</span>
              <span v-else-if="error" class="error-text">{{ error }}</span>
              <span v-else>{{ emptyText }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <AdminPagination
      v-model:page="table.page.value"
      v-model:pageSize="table.pageSize.value"
      :total-pages="table.totalPages.value"
      :page-size-options="pageSizeOptions"
    />
  </div>
</template>

<style scoped>
.data-table-wrap {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.toolbar {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.filter-field {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-xs);
  font-weight: 600;
  color: #6b7280;
}

.filter-label {
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.filter-control {
  padding: 6px 10px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: var(--font-xs);
  color: #111827;
  font-family: inherit;
  background: white;
  min-height: 2.5rem;
}

.filter-control:focus {
  border-color: var(--color-primary);
}

.filter-clear {
  background: none;
  border: none;
  color: var(--color-primary);
  font-size: var(--font-xs);
  font-weight: 600;
  cursor: pointer;
  padding: 4px 6px;
}

.data-table-scroll {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

thead th {
  padding: 10px 12px;
  text-align: left;
  font-size: var(--font-xs);
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1.5px solid #e5e7eb;
}

.sort-header {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  font-size: var(--font-xs);
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  cursor: pointer;
}

.sort-header:hover {
  color: var(--color-primary);
}

.sort-header-right {
  flex-direction: row-reverse;
}

.sort-indicator {
  font-size: var(--font-xs);
  color: var(--color-primary);
  min-width: 0.7rem;
}

.col-right {
  text-align: right;
}

.data-table tbody tr {
  height: 56px;
}

.data-row td {
  padding: 14px 12px;
  border-bottom: 1px solid #f3f4f6;
  font-size: 0.9rem;
  vertical-align: middle;
}

.filler-row td {
  border-bottom: 1px solid #f3f4f6;
}

.data-table tbody tr:last-child td {
  border-bottom: none;
}

.data-row:hover td {
  background: #fafafa;
}

.empty-row {
  text-align: center;
  color: v-bind('colors.neutral.mutedText');
  padding: 2.5rem 0;
}

.error-text {
  color: #dc2626;
}
</style>

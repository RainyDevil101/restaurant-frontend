import { describe, it, expect } from 'vitest';
import { ref } from 'vue';
import { useDataTable } from '../useDataTable';

interface Row {
  id: string;
  name: string;
  price: number;
  categoryName: string;
}

function makeRows(): Row[] {
  return [
    { id: '1', name: 'Tacos', price: 90, categoryName: 'Comida' },
    { id: '2', name: 'Agua', price: 30, categoryName: 'Bebida' },
    { id: '3', name: 'Flan', price: 50, categoryName: 'Postre' },
    { id: '4', name: 'Cerveza', price: 45, categoryName: 'Bebida' },
  ];
}

function makeTable(rows = makeRows()) {
  return useDataTable<Row>(ref(rows), {
    sortBy: 'name',
    pageSize: 2,
    sortAccessors: {
      name: (r) => r.name,
      categoryName: (r) => r.categoryName,
      price: (r) => r.price,
    },
    searchAccessor: (r) => r.name,
  });
}

function makeFilterTable(rows = makeRows()) {
  return useDataTable<Row>(ref(rows), {
    sortBy: 'name',
    pageSize: 10,
    sortAccessors: {
      name: (r) => r.name,
      categoryName: (r) => r.categoryName,
      price: (r) => r.price,
    },
    searchAccessor: (r) => r.name,
    columnFilters: [
      { key: 'categoryName', accessor: (r) => r.categoryName, match: 'equals' },
      { key: 'name', accessor: (r) => r.name, match: 'includes' },
    ],
  });
}

describe('useDataTable sorting', () => {
  it('sorts by name ascending by default', () => {
    const table = makeTable();
    expect(table.rows.value.map((r) => r.name)).toEqual(['Agua', 'Cerveza']);
  });

  it('toggles name to descending', () => {
    const table = makeTable();
    table.toggleSort('name');
    expect(table.sortDir.value).toBe('desc');
    expect(table.rows.value.map((r) => r.name)).toEqual(['Tacos', 'Flan']);
  });

  it('sorts by price numerically', () => {
    const table = makeTable();
    table.toggleSort('price');
    table.pageSize.value = 10;
    expect(table.rows.value.map((r) => r.price)).toEqual([30, 45, 50, 90]);
  });

  it('sorts by resolved category name (cross)', () => {
    const table = makeTable();
    table.toggleSort('categoryName');
    table.pageSize.value = 10;
    expect(table.rows.value.map((r) => r.categoryName)).toEqual([
      'Bebida',
      'Bebida',
      'Comida',
      'Postre',
    ]);
  });
});

describe('useDataTable pagination', () => {
  it('computes totalPages from totalItems and pageSize', () => {
    const table = makeTable();
    expect(table.totalItems.value).toBe(4);
    expect(table.totalPages.value).toBe(2);
  });

  it('slices the current page', () => {
    const table = makeTable();
    table.setPage(2);
    expect(table.page.value).toBe(2);
    expect(table.rows.value.map((r) => r.name)).toEqual(['Flan', 'Tacos']);
  });

  it('clamps setPage within bounds', () => {
    const table = makeTable();
    table.setPage(99);
    expect(table.page.value).toBe(2);
    table.setPage(-5);
    expect(table.page.value).toBe(1);
  });
});

describe('useDataTable page reset', () => {
  it('resets page to 1 when sort changes', () => {
    const table = makeTable();
    table.setPage(2);
    table.toggleSort('price');
    expect(table.page.value).toBe(1);
  });

  it('resets page to 1 when search changes', () => {
    const table = makeTable();
    table.setPage(2);
    table.search.value = 'a';
    expect(table.page.value).toBe(1);
  });

  it('resets page to 1 when pageSize changes', () => {
    const table = makeTable();
    table.setPage(2);
    table.pageSize.value = 50;
    expect(table.page.value).toBe(1);
  });

  it('filters case-insensitively by name', () => {
    const table = makeTable();
    table.search.value = 'CER';
    expect(table.totalItems.value).toBe(1);
    expect(table.rows.value.map((r) => r.name)).toEqual(['Cerveza']);
  });
});

describe('useDataTable column filters', () => {
  it('filters by an equals column filter', () => {
    const table = makeFilterTable();
    table.setFilter('categoryName', 'Bebida');
    expect(table.totalItems.value).toBe(2);
    expect(table.rows.value.map((r) => r.name)).toEqual(['Agua', 'Cerveza']);
  });

  it('filters by an includes column filter case-insensitively', () => {
    const table = makeFilterTable();
    table.setFilter('name', 'fL');
    expect(table.totalItems.value).toBe(1);
    expect(table.rows.value.map((r) => r.name)).toEqual(['Flan']);
  });

  it('combines a column filter with the global search', () => {
    const table = makeFilterTable();
    table.setFilter('categoryName', 'Bebida');
    table.search.value = 'agua';
    expect(table.totalItems.value).toBe(1);
    expect(table.rows.value.map((r) => r.name)).toEqual(['Agua']);
  });

  it('treats an empty filter value as inactive', () => {
    const table = makeFilterTable();
    table.setFilter('categoryName', 'Bebida');
    table.setFilter('categoryName', '');
    expect(table.totalItems.value).toBe(4);
  });

  it('resets page to 1 when a filter changes', () => {
    const table = makeFilterTable();
    table.pageSize.value = 2;
    table.setPage(2);
    table.setFilter('categoryName', 'Bebida');
    expect(table.page.value).toBe(1);
  });
});

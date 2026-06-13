import { describe, it, expect } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import DataTable from '../DataTable.vue';
import type { Column } from '../DataTable.vue';

interface Row {
  id: string;
  name: string;
  area: string;
  price: number;
}

const columns: Column<Row>[] = [
  { key: 'name', label: 'Nombre', sortable: true, filter: { type: 'text' } },
  {
    key: 'area',
    label: 'Área',
    sortable: true,
    filter: {
      type: 'select',
      options: [
        { value: 'cocina', label: 'Cocina' },
        { value: 'barra', label: 'Barra' },
      ],
    },
  },
  { key: 'price', label: 'Precio', sortable: true, align: 'right' },
];

const items: Row[] = [
  { id: '1', name: 'Tacos', area: 'cocina', price: 90 },
  { id: '2', name: 'Cerveza', area: 'barra', price: 50 },
  { id: '3', name: 'Quesadilla', area: 'cocina', price: 70 },
  { id: '4', name: 'Margarita', area: 'barra', price: 120 },
];

function mountTable(props: Record<string, unknown> = {}) {
  return mount(DataTable<Row>, {
    props: { items, columns, ...props },
  });
}

function bodyRows(wrapper: ReturnType<typeof mountTable>) {
  return wrapper.findAll('tbody tr.data-row');
}

describe('DataTable — rendering', () => {
  it('renders one header per column', () => {
    const wrapper = mountTable();
    const headers = wrapper.findAll('thead th');
    expect(headers).toHaveLength(3);
    const headerText = headers.map((h) => h.text()).join(' ');
    expect(headerText).toContain('Nombre');
    expect(headerText).toContain('Área');
    expect(headerText).toContain('Precio');
  });

  it('renders one row per item', () => {
    const wrapper = mountTable();
    expect(bodyRows(wrapper)).toHaveLength(4);
  });

  it('renders the resolved cell values by default', () => {
    const wrapper = mountTable();
    const tacosRow = bodyRows(wrapper).find((r) => r.text().includes('Tacos'))!;
    expect(tacosRow).toBeTruthy();
    expect(tacosRow.text()).toContain('cocina');
    expect(tacosRow.text()).toContain('90');
  });

  it('renders sortable headers as buttons and non-sortable as spans', () => {
    const wrapper = mount(DataTable<Row>, {
      props: {
        items,
        columns: [
          { key: 'name', label: 'Nombre', sortable: true },
          { key: 'area', label: 'Área' },
        ] as Column<Row>[],
      },
    });
    const headers = wrapper.findAll('thead th');
    expect(headers[0]!.find('button.sort-header').exists()).toBe(true);
    expect(headers[1]!.find('button.sort-header').exists()).toBe(false);
  });
});

describe('DataTable — sorting', () => {
  // The first sortable column (name) is the initial sort, ascending, on mount.
  it('is sorted ascending by the first sortable column on mount', () => {
    const wrapper = mountTable();
    const names = bodyRows(wrapper).map((r) => r.text());
    // alphabetical asc: Cerveza, Margarita, Quesadilla, Tacos
    expect(names[0]).toContain('Cerveza');
    expect(names[3]).toContain('Tacos');
    expect(wrapper.findAll('thead th')[0]!.find('.sort-indicator').text()).toBe('▲');
  });

  it('sorts ascending when clicking a column that is not the active sort', async () => {
    const wrapper = mountTable();
    const priceHeader = wrapper.findAll('thead th')[2]!.find('button');
    await priceHeader.trigger('click');
    await nextTick();
    const prices = bodyRows(wrapper).map((r) => r.text());
    // price asc: 50, 70, 90, 120
    expect(prices[0]).toContain('50');
    expect(prices[3]).toContain('120');
    expect(priceHeader.find('.sort-indicator').text()).toBe('▲');
  });

  it('cycles ascending → descending on a repeat click of the active column', async () => {
    const wrapper = mountTable();
    const nameHeader = wrapper.findAll('thead th')[0]!.find('button');
    // already asc on mount; one click flips to desc
    await nameHeader.trigger('click');
    await nextTick();
    const names = bodyRows(wrapper).map((r) => r.text());
    expect(names[0]).toContain('Tacos');
    expect(names[3]).toContain('Cerveza');
    expect(nameHeader.find('.sort-indicator').text()).toBe('▼');
  });

  it('cycles descending → ascending on a third click', async () => {
    const wrapper = mountTable();
    const nameHeader = wrapper.findAll('thead th')[0]!.find('button');
    await nameHeader.trigger('click'); // asc -> desc
    await nextTick();
    await nameHeader.trigger('click'); // desc -> asc
    await nextTick();
    expect(nameHeader.find('.sort-indicator').text()).toBe('▲');
  });

  it('moves the active indicator when switching to a different column', async () => {
    const wrapper = mountTable();
    const priceHeader = wrapper.findAll('thead th')[2]!.find('button');
    await priceHeader.trigger('click');
    await nextTick();
    expect(priceHeader.find('.sort-indicator').text()).toBe('▲');
    expect(wrapper.findAll('thead th')[0]!.find('.sort-indicator').text()).toBe('');
  });
});

describe('DataTable — search', () => {
  it('narrows rows to those matching the search query', async () => {
    const wrapper = mountTable();
    const input = wrapper.find('.search-wrap input');
    await input.setValue('Tacos');
    await nextTick();
    const rows = bodyRows(wrapper);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.text()).toContain('Tacos');
  });

  it('shows the empty state when the search matches nothing', async () => {
    const wrapper = mountTable({ emptyText: 'Nada aquí' });
    await wrapper.find('.search-wrap input').setValue('zzz-no-match');
    await nextTick();
    expect(bodyRows(wrapper)).toHaveLength(0);
    expect(wrapper.find('.empty-row').text()).toBe('Nada aquí');
  });
});

describe('DataTable — column filters', () => {
  it('renders a filter control per filterable column', () => {
    const wrapper = mountTable();
    expect(wrapper.findAll('.filter-field')).toHaveLength(2);
    expect(wrapper.find('select.filter-control').exists()).toBe(true);
    expect(wrapper.find('input.filter-control').exists()).toBe(true);
  });

  it('filters rows via the select filter (exact match)', async () => {
    const wrapper = mountTable();
    const select = wrapper.find('select.filter-control');
    await select.setValue('barra');
    await nextTick();
    const rows = bodyRows(wrapper);
    expect(rows).toHaveLength(2);
    expect(rows.every((r) => r.text().includes('barra'))).toBe(true);
  });

  it('filters rows via the text filter (includes match)', async () => {
    const wrapper = mountTable();
    const textFilter = wrapper.find('input.filter-control');
    await textFilter.setValue('Ques');
    await nextTick();
    const rows = bodyRows(wrapper);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.text()).toContain('Quesadilla');
  });

  it('shows the clear-filters button only when a filter is active and clears it', async () => {
    const wrapper = mountTable();
    expect(wrapper.find('.filter-clear').exists()).toBe(false);
    await wrapper.find('select.filter-control').setValue('cocina');
    await nextTick();
    expect(wrapper.find('.filter-clear').exists()).toBe(true);
    await wrapper.find('.filter-clear').trigger('click');
    await nextTick();
    expect(bodyRows(wrapper)).toHaveLength(4);
    expect(wrapper.find('.filter-clear').exists()).toBe(false);
  });

  it('does not render the filter bar when no column is filterable', () => {
    const wrapper = mount(DataTable<Row>, {
      props: {
        items,
        columns: [{ key: 'name', label: 'Nombre', sortable: true }] as Column<Row>[],
      },
    });
    expect(wrapper.find('.filter-bar').exists()).toBe(false);
  });
});

describe('DataTable — pagination', () => {
  it('limits visible rows to the page size', () => {
    const wrapper = mountTable({ pageSize: 2 });
    expect(bodyRows(wrapper)).toHaveLength(2);
  });

  it('advances to the next page with the next button', async () => {
    const wrapper = mountTable({ pageSize: 2, defaultSort: 'price', defaultSortDir: 'asc' });
    // page 1 (asc by price): Cerveza(50), Quesadilla(70)
    expect(bodyRows(wrapper)[0]!.text()).toContain('Cerveza');
    const nextBtn = wrapper.find('button[aria-label="Página siguiente"]');
    await nextBtn.trigger('click');
    await nextTick();
    // page 2: Tacos(90), Margarita(120)
    const rows = bodyRows(wrapper);
    expect(rows).toHaveLength(2);
    expect(rows[0]!.text()).toContain('Tacos');
  });

  it('disables the previous button on the first page', () => {
    const wrapper = mountTable({ pageSize: 2 });
    const prev = wrapper.find('button[aria-label="Página anterior"]');
    expect(prev.attributes('disabled')).toBeDefined();
  });

  it('reports the total page count', () => {
    const wrapper = mountTable({ pageSize: 2 });
    expect(wrapper.find('.page-status').text()).toContain('de 2');
  });
});

describe('DataTable — loading / error / empty states', () => {
  it('shows the loading text when loading and there are no items', () => {
    const wrapper = mount(DataTable<Row>, {
      props: { items: [], columns, loading: true },
    });
    expect(wrapper.find('.empty-row').text()).toBe('Cargando…');
  });

  it('shows the error text when an error is present and there are no items', () => {
    const wrapper = mount(DataTable<Row>, {
      props: { items: [], columns, error: 'Falló la carga' },
    });
    const cell = wrapper.find('.empty-row');
    expect(cell.find('.error-text').text()).toBe('Falló la carga');
  });

  it('shows the default empty text when there are no items and no loading/error', () => {
    const wrapper = mount(DataTable<Row>, {
      props: { items: [], columns },
    });
    expect(wrapper.find('.empty-row').text()).toBe('Sin resultados');
  });
});

describe('DataTable — cell slot overrides', () => {
  it('renders a custom cell slot instead of the default value', async () => {
    const wrapper = mount(DataTable<Row>, {
      props: { items, columns },
      slots: {
        'cell-price': `<template #cell-price="{ row }"><span class="custom-price">$\{{ row.price }}</span></template>`,
      },
    });
    await flushPromises();
    const custom = wrapper.findAll('.custom-price');
    expect(custom.length).toBeGreaterThan(0);
    expect(custom[0]!.text()).toContain('$');
  });
});

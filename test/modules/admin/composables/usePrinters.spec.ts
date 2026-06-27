import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h } from 'vue';

vi.mock('@/shared/api/settings', () => ({
  listPrinters: vi.fn<typeof import('@/shared/api/settings').listPrinters>(),
  createPrinter: vi.fn<typeof import('@/shared/api/settings').createPrinter>(),
  updatePrinter: vi.fn<typeof import('@/shared/api/settings').updatePrinter>(),
  deletePrinter: vi.fn<typeof import('@/shared/api/settings').deletePrinter>(),
}));

vi.mock('@/shared/toast', () => ({
  toast: {
    success: vi.fn<typeof import('@/shared/toast').toast.success>(),
    error: vi.fn<typeof import('@/shared/toast').toast.error>(),
    info: vi.fn<typeof import('@/shared/toast').toast.info>(),
  },
}));

import {
  listPrinters,
  createPrinter,
  updatePrinter,
  deletePrinter,
  type Printer,
} from '@/shared/api/settings';
import { ApiRequestError } from '@/shared/api/client';
import { toast } from '@/shared/toast';
import { usePrinters } from '@/modules/admin/composables/usePrinters';

const printer: Printer = {
  id: 'pr1',
  name: 'Caja 1',
  connection: 'usb',
  paperWidth: 80,
  isDefault: true,
};

function withSetup(): ReturnType<typeof usePrinters> {
  let result!: ReturnType<typeof usePrinters>;
  mount(
    defineComponent({
      setup() {
        result = usePrinters();
        return () => h('div');
      },
    }),
  );
  return result;
}

describe('usePrinters', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(listPrinters).mockResolvedValue([printer]);
    vi.mocked(createPrinter).mockResolvedValue(printer);
    vi.mocked(updatePrinter).mockResolvedValue(printer);
    vi.mocked(deletePrinter).mockResolvedValue(undefined);
  });

  it('loads printers on mount', async () => {
    const { printers, loading } = withSetup();
    await flushPromises();
    expect(listPrinters).toHaveBeenCalledTimes(1);
    expect(printers.value).toEqual([printer]);
    expect(loading.value).toBe(false);
  });

  it('surfaces the ApiRequestError message when the load fails', async () => {
    vi.mocked(listPrinters).mockRejectedValue(new ApiRequestError('caído', 500, null));
    const { error } = withSetup();
    await flushPromises();
    expect(error.value).toBe('caído');
  });

  it('createPrinter calls the API, reloads, and toasts success', async () => {
    const { createPrinter: create } = withSetup();
    await flushPromises();
    vi.mocked(listPrinters).mockClear();
    await create({ name: 'Caja 2', connection: 'bluetooth', paperWidth: 58 });
    expect(createPrinter).toHaveBeenCalledWith({
      name: 'Caja 2',
      connection: 'bluetooth',
      paperWidth: 58,
    });
    expect(listPrinters).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith('Impresora creada');
  });

  it('createPrinter toasts an error and rethrows on failure', async () => {
    vi.mocked(createPrinter).mockRejectedValue(new Error('boom'));
    const { createPrinter: create } = withSetup();
    await flushPromises();
    await expect(create({ name: 'X', connection: 'usb', paperWidth: 80 })).rejects.toThrow('boom');
    expect(toast.error).toHaveBeenCalledWith('No se pudo crear la impresora.');
  });

  it('updatePrinter calls the API, reloads, and toasts success', async () => {
    const { updatePrinter: update } = withSetup();
    await flushPromises();
    vi.mocked(listPrinters).mockClear();
    await update('pr1', { name: 'Renombrada' });
    expect(updatePrinter).toHaveBeenCalledWith('pr1', { name: 'Renombrada' });
    expect(listPrinters).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith('Impresora actualizada');
  });

  it('removePrinter calls the API, reloads, and toasts success', async () => {
    const { removePrinter } = withSetup();
    await flushPromises();
    vi.mocked(listPrinters).mockClear();
    await removePrinter('pr1');
    expect(deletePrinter).toHaveBeenCalledWith('pr1');
    expect(listPrinters).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith('Impresora eliminada');
  });

  it('setDefault patches the printer with isDefault true', async () => {
    const { setDefault } = withSetup();
    await flushPromises();
    await setDefault('pr1');
    expect(updatePrinter).toHaveBeenCalledWith('pr1', { isDefault: true });
  });
});

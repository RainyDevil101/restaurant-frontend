import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h } from 'vue';

vi.mock('@/shared/api/settings', () => ({
  getReceiptSettings: vi.fn<typeof import('@/shared/api/settings').getReceiptSettings>(),
  updateReceiptSettings: vi.fn<typeof import('@/shared/api/settings').updateReceiptSettings>(),
}));

vi.mock('@/shared/toast', () => ({
  toast: {
    success: vi.fn<typeof import('@/shared/toast').toast.success>(),
    error: vi.fn<typeof import('@/shared/toast').toast.error>(),
    info: vi.fn<typeof import('@/shared/toast').toast.info>(),
  },
}));

import { getReceiptSettings, updateReceiptSettings } from '@/shared/api/settings';
import { ApiRequestError } from '@/shared/api/client';
import { toast } from '@/shared/toast';
import { useReceiptSettings } from '../useReceiptSettings';

const settings = {
  id: 'r1',
  businessName: 'Subito',
  address: 'Calle Falsa 123',
  footer: 'Gracias por su visita',
};

function withSetup(): ReturnType<typeof useReceiptSettings> {
  let result!: ReturnType<typeof useReceiptSettings>;
  mount(
    defineComponent({
      setup() {
        result = useReceiptSettings();
        return () => h('div');
      },
    }),
  );
  return result;
}

describe('useReceiptSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getReceiptSettings).mockResolvedValue(settings);
    vi.mocked(updateReceiptSettings).mockResolvedValue(settings);
  });

  it('loads the receipt settings on mount', async () => {
    const { settings: state, loading, error } = withSetup();
    expect(loading.value).toBe(true);
    await flushPromises();
    expect(getReceiptSettings).toHaveBeenCalledTimes(1);
    expect(state.value).toEqual(settings);
    expect(loading.value).toBe(false);
    expect(error.value).toBe('');
  });

  it('surfaces the ApiRequestError message when the load fails', async () => {
    vi.mocked(getReceiptSettings).mockRejectedValue(
      new ApiRequestError('servidor caído', 500, null),
    );
    const { error } = withSetup();
    await flushPromises();
    expect(error.value).toBe('servidor caído');
  });

  it('falls back to a generic message for a non-API load error', async () => {
    vi.mocked(getReceiptSettings).mockRejectedValue(new Error('boom'));
    const { error } = withSetup();
    await flushPromises();
    expect(error.value).toBe('No se pudieron cargar los datos del comprobante.');
  });

  it('save updates the settings and shows a success toast', async () => {
    const updated = { ...settings, businessName: 'Subito MX' };
    vi.mocked(updateReceiptSettings).mockResolvedValue(updated);
    const { save, settings: state } = withSetup();
    await flushPromises();
    await save({ businessName: 'Subito MX' });
    expect(updateReceiptSettings).toHaveBeenCalledWith({ businessName: 'Subito MX' });
    expect(state.value).toEqual(updated);
    expect(toast.success).toHaveBeenCalledWith('Datos del comprobante guardados');
  });

  it('save shows an error toast and rethrows when the API fails', async () => {
    vi.mocked(updateReceiptSettings).mockRejectedValue(
      new ApiRequestError('no autorizado', 401, null),
    );
    const { save } = withSetup();
    await flushPromises();
    await expect(save({ footer: 'x' })).rejects.toThrow('no autorizado');
    expect(toast.error).toHaveBeenCalledWith('no autorizado');
  });

  it('save uses a generic error toast for a non-API failure', async () => {
    vi.mocked(updateReceiptSettings).mockRejectedValue(new Error('boom'));
    const { save } = withSetup();
    await flushPromises();
    await expect(save({ footer: 'x' })).rejects.toThrow('boom');
    expect(toast.error).toHaveBeenCalledWith('No se pudieron guardar los datos.');
  });

  it('reload re-fetches the settings', async () => {
    const { reload } = withSetup();
    await flushPromises();
    vi.mocked(getReceiptSettings).mockClear();
    await reload();
    expect(getReceiptSettings).toHaveBeenCalledTimes(1);
  });
});

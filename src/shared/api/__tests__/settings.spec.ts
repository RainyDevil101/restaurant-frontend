import { describe, it, expect, vi, beforeEach } from 'vitest';

const { get, post, patch, put, del } = vi.hoisted(() => ({
  get: vi.fn<typeof import('../client').api.get>(() => Promise.resolve(undefined as never)),
  post: vi.fn<typeof import('../client').api.post>(() => Promise.resolve(undefined as never)),
  patch: vi.fn<typeof import('../client').api.patch>(() => Promise.resolve(undefined as never)),
  put: vi.fn<typeof import('../client').api.put>(() => Promise.resolve(undefined as never)),
  del: vi.fn<typeof import('../client').api.delete>(() => Promise.resolve(undefined as never)),
}));

vi.mock('../client', () => ({
  api: { get, post, patch, put, delete: del },
}));

import * as settings from '../settings';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('settings api', () => {
  it('listPrinters GETs /settings/printers', () => {
    settings.listPrinters();
    expect(get).toHaveBeenCalledWith('/settings/printers');
  });

  it('createPrinter POSTs /settings/printers with input', () => {
    const input = {
      name: 'Caja',
      connection: 'usb' as const,
      paperWidth: 80 as const,
    };
    settings.createPrinter(input);
    expect(post).toHaveBeenCalledWith('/settings/printers', input);
  });

  it('updatePrinter PATCHes /settings/printers/:id with input', () => {
    settings.updatePrinter('pr1', { name: 'X' });
    expect(patch).toHaveBeenCalledWith('/settings/printers/pr1', { name: 'X' });
  });

  it('deletePrinter DELETEs /settings/printers/:id', () => {
    settings.deletePrinter('pr1');
    expect(del).toHaveBeenCalledWith('/settings/printers/pr1');
  });

  it('getReceiptSettings GETs /settings/receipt', () => {
    settings.getReceiptSettings();
    expect(get).toHaveBeenCalledWith('/settings/receipt');
  });

  it('updateReceiptSettings PUTs /settings/receipt with input', () => {
    const input = { businessName: 'Subito', footer: 'Gracias' };
    settings.updateReceiptSettings(input);
    expect(put).toHaveBeenCalledWith('/settings/receipt', input);
  });
});

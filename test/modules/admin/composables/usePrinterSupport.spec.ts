import { describe, it, expect, vi, afterEach } from 'vitest';
import { usePrinterSupport } from '@/modules/admin/composables/usePrinterSupport';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('usePrinterSupport', () => {
  it('reports USB and Bluetooth supported when both APIs are present in a secure context', () => {
    vi.stubGlobal('navigator', { usb: {}, bluetooth: {} });
    vi.stubGlobal('window', { isSecureContext: true });
    const { usbSupported, bluetoothSupported, secureContext, printingSupported } =
      usePrinterSupport();
    expect(usbSupported.value).toBe(true);
    expect(bluetoothSupported.value).toBe(true);
    expect(secureContext.value).toBe(true);
    expect(printingSupported.value).toBe(true);
  });

  it('reports USB supported but Bluetooth unsupported when only navigator.usb exists', () => {
    vi.stubGlobal('navigator', { usb: {} });
    vi.stubGlobal('window', { isSecureContext: true });
    const { usbSupported, bluetoothSupported, printingSupported } = usePrinterSupport();
    expect(usbSupported.value).toBe(true);
    expect(bluetoothSupported.value).toBe(false);
    expect(printingSupported.value).toBe(true);
  });

  it('reports neither transport supported when both APIs are absent', () => {
    vi.stubGlobal('navigator', {});
    vi.stubGlobal('window', { isSecureContext: true });
    const { usbSupported, bluetoothSupported, printingSupported } = usePrinterSupport();
    expect(usbSupported.value).toBe(false);
    expect(bluetoothSupported.value).toBe(false);
    expect(printingSupported.value).toBe(false);
  });

  it('disables printing outside a secure context even when transports exist', () => {
    vi.stubGlobal('navigator', { usb: {}, bluetooth: {} });
    vi.stubGlobal('window', { isSecureContext: false });
    const { usbSupported, bluetoothSupported, secureContext, printingSupported } =
      usePrinterSupport();
    expect(usbSupported.value).toBe(true);
    expect(bluetoothSupported.value).toBe(true);
    expect(secureContext.value).toBe(false);
    expect(printingSupported.value).toBe(false);
  });
});

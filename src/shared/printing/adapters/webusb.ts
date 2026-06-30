import type { ConnectedPrinter, PrinterAdapter } from '../types';
import { PRINTER_CONNECTION } from '@/shared/types';
import { PRINTER_CONNECTION_LABEL } from '@/shared/constants/labels';
import { PRINTER_MESSAGES } from '../messages';

export const webUsbAdapter: PrinterAdapter = {
  id: PRINTER_CONNECTION.USB,
  label: PRINTER_CONNECTION_LABEL[PRINTER_CONNECTION.USB],

  isSupported() {
    return 'usb' in navigator && window.isSecureContext;
  },

  async connect(): Promise<ConnectedPrinter> {
    const device = await navigator.usb.requestDevice({ filters: [] });
    await device.open();
    if (!device.configuration) await device.selectConfiguration(1);

    const config = device.configuration;
    if (!config) throw new Error(PRINTER_MESSAGES.usbNoConfiguration);

    let target: { interfaceNumber: number; endpointNumber: number } | null = null;
    for (const iface of config.interfaces) {
      const endpoint = iface.alternate.endpoints.find(
        (e) => e.direction === 'out' && e.type === 'bulk',
      );
      if (endpoint) {
        target = {
          interfaceNumber: iface.interfaceNumber,
          endpointNumber: endpoint.endpointNumber,
        };
        break;
      }
    }
    if (!target) throw new Error(PRINTER_MESSAGES.usbNoEndpoint);

    await device.claimInterface(target.interfaceNumber);
    const endpointNumber = target.endpointNumber;

    return {
      name:
        device.productName ||
        `${PRINTER_CONNECTION_LABEL[PRINTER_CONNECTION.USB]} ${device.vendorId.toString(16)}:${device.productId.toString(16)}`,
      async write(bytes) {
        await device.transferOut(endpointNumber, bytes as BufferSource);
      },
      async disconnect() {
        await device.close().catch(() => undefined);
      },
    };
  },
};

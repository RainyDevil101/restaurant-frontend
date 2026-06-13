import { webUsbAdapter } from './adapters/webusb';
import { webBluetoothAdapter } from './adapters/web-bluetooth';
import type { PrinterAdapter, PrinterTransportId } from './types';

export type { PrinterAdapter, ConnectedPrinter, PrinterTransportId } from './types';
export { base64ToBytes, testTicket } from './escpos';
export { printerErrorMessage } from './errors';

export const printerAdapters: Record<PrinterTransportId, PrinterAdapter> = {
  usb: webUsbAdapter,
  bluetooth: webBluetoothAdapter,
};

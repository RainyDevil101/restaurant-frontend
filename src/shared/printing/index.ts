import { webUsbAdapter } from './adapters/webusb';
import { webBluetoothAdapter } from './adapters/web-bluetooth';
import { PRINTER_CONNECTION } from '@/shared/types';
import type { PrinterAdapter, PrinterTransportId } from './types';

export type { PrinterAdapter, ConnectedPrinter, PrinterTransportId } from './types';
export { base64ToBytes, testTicket } from './escpos';
export { printerErrorMessage } from './errors';

export const printerAdapters: Record<PrinterTransportId, PrinterAdapter> = {
  [PRINTER_CONNECTION.USB]: webUsbAdapter,
  [PRINTER_CONNECTION.BLUETOOTH]: webBluetoothAdapter,
};

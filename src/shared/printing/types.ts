import type { PrinterConnection } from '@/shared/types';

export type PrinterTransportId = PrinterConnection;

export interface ConnectedPrinter {
  name: string;
  write(bytes: Uint8Array): Promise<void>;
  disconnect(): Promise<void>;
}

export interface PrinterAdapter {
  readonly id: PrinterTransportId;
  readonly label: string;
  isSupported(): boolean;
  connect(): Promise<ConnectedPrinter>;
}

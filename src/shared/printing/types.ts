export type PrinterTransportId = 'usb' | 'bluetooth';

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

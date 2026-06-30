export const PRINTER_CONNECTION = {
  USB: 'usb',
  BLUETOOTH: 'bluetooth',
} as const;

export type PrinterConnection = (typeof PRINTER_CONNECTION)[keyof typeof PRINTER_CONNECTION];

export const PAPER_WIDTH = {
  NARROW: 58,
  WIDE: 80,
} as const;

export type PaperWidth = (typeof PAPER_WIDTH)[keyof typeof PAPER_WIDTH];

export const DEFAULT_PAPER_WIDTH: PaperWidth = PAPER_WIDTH.WIDE;

import { api } from './client';
import { ENDPOINTS } from './endpoints';
import type { PrinterConnection, PaperWidth } from '@/shared/types';

export type { PrinterConnection, PaperWidth } from '@/shared/types';

export interface Printer {
  id: string;
  name: string;
  connection: PrinterConnection;
  paperWidth: PaperWidth;
  isDefault: boolean;
}

export interface ReceiptSettings {
  id: string;
  businessName: string;
  address: string;
  footer: string;
}

export interface CreatePrinterInput {
  name: string;
  connection: PrinterConnection;
  paperWidth: PaperWidth;
  isDefault?: boolean;
}

export interface UpdatePrinterInput {
  name?: string;
  connection?: PrinterConnection;
  paperWidth?: PaperWidth;
  isDefault?: boolean;
}

export interface UpdateReceiptInput {
  businessName?: string;
  address?: string;
  footer?: string;
}

export function listPrinters(): Promise<Printer[]> {
  return api.get<Printer[]>(ENDPOINTS.settings.printers);
}

export function createPrinter(input: CreatePrinterInput): Promise<Printer> {
  return api.post<Printer>(ENDPOINTS.settings.printers, input);
}

export function updatePrinter(id: string, input: UpdatePrinterInput): Promise<Printer> {
  return api.patch<Printer>(ENDPOINTS.settings.printerById(id), input);
}

export function deletePrinter(id: string): Promise<void> {
  return api.delete<void>(ENDPOINTS.settings.printerById(id));
}

export function getReceiptSettings(): Promise<ReceiptSettings> {
  return api.get<ReceiptSettings>(ENDPOINTS.settings.receipt);
}

export function updateReceiptSettings(input: UpdateReceiptInput): Promise<ReceiptSettings> {
  return api.put<ReceiptSettings>(ENDPOINTS.settings.receipt, input);
}

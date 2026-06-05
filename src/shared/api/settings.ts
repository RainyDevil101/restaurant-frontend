import { api } from './client'

export type PrinterConnection = 'usb' | 'bluetooth'
export type PaperWidth = 58 | 80

export interface Printer {
  id: string
  name: string
  connection: PrinterConnection
  paperWidth: PaperWidth
  isDefault: boolean
}

export interface ReceiptSettings {
  id: string
  businessName: string
  address: string
  footer: string
}

export interface CreatePrinterInput {
  name: string
  connection: PrinterConnection
  paperWidth: PaperWidth
  isDefault?: boolean
}

export interface UpdatePrinterInput {
  name?: string
  connection?: PrinterConnection
  paperWidth?: PaperWidth
  isDefault?: boolean
}

export interface UpdateReceiptInput {
  businessName?: string
  address?: string
  footer?: string
}

export function listPrinters(): Promise<Printer[]> {
  return api.get<Printer[]>('/settings/printers')
}

export function createPrinter(input: CreatePrinterInput): Promise<Printer> {
  return api.post<Printer>('/settings/printers', input)
}

export function updatePrinter(id: string, input: UpdatePrinterInput): Promise<Printer> {
  return api.patch<Printer>(`/settings/printers/${id}`, input)
}

export function deletePrinter(id: string): Promise<void> {
  return api.delete<void>(`/settings/printers/${id}`)
}

export function getReceiptSettings(): Promise<ReceiptSettings> {
  return api.get<ReceiptSettings>('/settings/receipt')
}

export function updateReceiptSettings(input: UpdateReceiptInput): Promise<ReceiptSettings> {
  return api.put<ReceiptSettings>('/settings/receipt', input)
}

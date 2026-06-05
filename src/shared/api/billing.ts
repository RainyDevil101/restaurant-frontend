import { api } from './client'
import type { Bill, PaymentMethod } from '@/shared/types'

export interface ProcessPaymentInput {
  method: PaymentMethod
  amount: number
}

export interface ApiPayment {
  id: string
  billId: string
  tableId: string
  amount: number
  method: PaymentMethod
  change: number
  paidAt: string
}

export function getBill(tableId: string): Promise<Bill> {
  return api.get<Bill>(`/billing/table/${tableId}`)
}

export function consolidateBill(tableId: string): Promise<Bill> {
  return api.post<Bill>(`/billing/table/${tableId}/consolidate`)
}

export function payBill(tableId: string, input: ProcessPaymentInput): Promise<ApiPayment> {
  return api.post<ApiPayment>(`/billing/table/${tableId}/payment`, input)
}

export function listPayments(): Promise<ApiPayment[]> {
  return api.get<ApiPayment[]>('/billing/payments')
}

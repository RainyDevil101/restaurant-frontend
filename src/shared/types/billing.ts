export type PaymentMethod = 'efectivo' | 'tarjeta'

export const PAYMENT_METHOD = {
  CASH: 'efectivo' as PaymentMethod,
  CARD: 'tarjeta' as PaymentMethod,
} as const

export interface BillItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  subtotal: number
}

export interface Bill {
  id: string
  tableId: string
  items: BillItem[]
  total: number
  createdAt: string
}

export interface Payment {
  id: string
  billId: string
  amount: number
  method: PaymentMethod
  paidAt: string
}

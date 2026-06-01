export interface DailySalesReport {
  date: string
  totalSales: number
  totalOrders: number
  paymentBreakdown: {
    efectivo: number
    tarjeta: number
  }
}

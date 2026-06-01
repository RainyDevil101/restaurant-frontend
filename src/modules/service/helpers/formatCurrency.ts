const formatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 0,
})

export function formatCurrency(amount: number): string {
  return formatter.format(amount)
}

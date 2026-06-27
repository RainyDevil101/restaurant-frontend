export const CHECKOUT_MESSAGES = {
  LOAD_DASHBOARD_ERROR: 'No se pudo cargar el tablero.',
  LOAD_BILL_ERROR: 'No se pudo cargar la cuenta.',
  PAYMENT_SUCCESS: 'Pago registrado correctamente',
  PAYMENT_ERROR: 'No se pudo registrar el pago.',
  CANCEL_ORDER_ERROR: 'No se pudo cancelar el pedido.',
  PRINTER_NOT_CONNECTED: 'Conecta la impresora primero en Configuraciones',
  PRINTER_NOT_CONFIGURED: 'Configura una impresora en Ajustes antes de imprimir',
  PRECHECK_PRINTED: 'Precuenta impresa',
  newOrder: (tableName: string) => `Nuevo pedido · ${tableName}`,
  comandaPrinted: (count: number) => `Comanda impresa · ${count} área${count !== 1 ? 's' : ''}`,
} as const;

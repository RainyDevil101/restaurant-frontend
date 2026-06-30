export const PRINTER_MESSAGES = {
  notConnected: 'No hay impresora conectada.',
  usbNoConfiguration: 'La impresora no expone una configuración USB.',
  usbNoEndpoint: 'No se encontró un endpoint de impresión (bulk OUT) en el dispositivo.',
  bleNoGatt: 'No se pudo conectar al servicio GATT de la impresora.',
  bleNoCharacteristic: 'La impresora no expone una característica de escritura (BLE).',
  bluetoothDeviceFallback: 'Impresora Bluetooth',
} as const;

import type { ConnectedPrinter, PrinterAdapter } from '../types'

const PRINTER_SERVICES: BluetoothServiceUUID[] = [
  0x18f0,
  0xff00,
  '000018f0-0000-1000-8000-00805f9b34fb',
  '0000ff00-0000-1000-8000-00805f9b34fb',
  '49535343-fe7d-4ae5-8fa9-9fafd205e455',
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
]

const CHUNK_SIZE = 180

export const webBluetoothAdapter: PrinterAdapter = {
  id: 'bluetooth',
  label: 'Bluetooth',

  isSupported() {
    return 'bluetooth' in navigator && window.isSecureContext
  },

  async connect(): Promise<ConnectedPrinter> {
    const device = await navigator.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: PRINTER_SERVICES,
    })
    const server = await device.gatt?.connect()
    if (!server) throw new Error('No se pudo conectar al servicio GATT de la impresora.')

    let characteristic: BluetoothRemoteGATTCharacteristic | undefined
    for (const service of await server.getPrimaryServices()) {
      const chars = await service.getCharacteristics()
      characteristic = chars.find((c) => c.properties.write || c.properties.writeWithoutResponse)
      if (characteristic) break
    }
    if (!characteristic) {
      throw new Error('La impresora no expone una característica de escritura (BLE).')
    }
    const writable = characteristic

    return {
      name: device.name || 'Impresora Bluetooth',
      async write(bytes) {
        for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
          const chunk = bytes.slice(i, i + CHUNK_SIZE)
          if (writable.properties.writeWithoutResponse) await writable.writeValueWithoutResponse(chunk)
          else await writable.writeValue(chunk)
        }
      },
      async disconnect() {
        device.gatt?.disconnect()
      },
    }
  },
}

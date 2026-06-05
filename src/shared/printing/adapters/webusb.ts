import type { ConnectedPrinter, PrinterAdapter } from '../types'

export const webUsbAdapter: PrinterAdapter = {
  id: 'usb',
  label: 'USB',

  isSupported() {
    return 'usb' in navigator && window.isSecureContext
  },

  async connect(): Promise<ConnectedPrinter> {
    const device = await navigator.usb.requestDevice({ filters: [] })
    await device.open()
    if (!device.configuration) await device.selectConfiguration(1)

    const config = device.configuration
    if (!config) throw new Error('La impresora no expone una configuración USB.')

    let target: { interfaceNumber: number; endpointNumber: number } | null = null
    for (const iface of config.interfaces) {
      const endpoint = iface.alternate.endpoints.find(
        (e) => e.direction === 'out' && e.type === 'bulk',
      )
      if (endpoint) {
        target = { interfaceNumber: iface.interfaceNumber, endpointNumber: endpoint.endpointNumber }
        break
      }
    }
    if (!target) throw new Error('No se encontró un endpoint de impresión (bulk OUT) en el dispositivo.')

    await device.claimInterface(target.interfaceNumber)
    const endpointNumber = target.endpointNumber

    return {
      name:
        device.productName ||
        `USB ${device.vendorId.toString(16)}:${device.productId.toString(16)}`,
      async write(bytes) {
        await device.transferOut(endpointNumber, bytes as BufferSource)
      },
      async disconnect() {
        await device.close().catch(() => undefined)
      },
    }
  },
}

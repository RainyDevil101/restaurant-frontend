import { describe, it, expect, vi, afterEach } from 'vitest'
import { webUsbAdapter } from '../adapters/webusb'
import { webBluetoothAdapter } from '../adapters/web-bluetooth'

// These tests only cover the pure feature-detection (`isSupported`) and static
// metadata of each transport adapter. The `connect()` methods drive the real
// Web USB / Web Bluetooth device-selection + GATT/endpoint negotiation, which
// would require deep, brittle hardware-event simulation — intentionally not
// tested here.

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('webUsbAdapter', () => {
  it('exposes the usb id and USB label', () => {
    expect(webUsbAdapter.id).toBe('usb')
    expect(webUsbAdapter.label).toBe('USB')
  })

  it('isSupported is true when navigator.usb exists in a secure context', () => {
    vi.stubGlobal('navigator', { usb: {} })
    vi.stubGlobal('window', { isSecureContext: true })
    expect(webUsbAdapter.isSupported()).toBe(true)
  })

  it('isSupported is false when navigator.usb is missing', () => {
    vi.stubGlobal('navigator', {})
    vi.stubGlobal('window', { isSecureContext: true })
    expect(webUsbAdapter.isSupported()).toBe(false)
  })

  it('isSupported is false outside a secure context', () => {
    vi.stubGlobal('navigator', { usb: {} })
    vi.stubGlobal('window', { isSecureContext: false })
    expect(webUsbAdapter.isSupported()).toBe(false)
  })
})

describe('webBluetoothAdapter', () => {
  it('exposes the bluetooth id and Bluetooth label', () => {
    expect(webBluetoothAdapter.id).toBe('bluetooth')
    expect(webBluetoothAdapter.label).toBe('Bluetooth')
  })

  it('isSupported is true when navigator.bluetooth exists in a secure context', () => {
    vi.stubGlobal('navigator', { bluetooth: {} })
    vi.stubGlobal('window', { isSecureContext: true })
    expect(webBluetoothAdapter.isSupported()).toBe(true)
  })

  it('isSupported is false when navigator.bluetooth is missing', () => {
    vi.stubGlobal('navigator', {})
    vi.stubGlobal('window', { isSecureContext: true })
    expect(webBluetoothAdapter.isSupported()).toBe(false)
  })

  it('isSupported is false outside a secure context', () => {
    vi.stubGlobal('navigator', { bluetooth: {} })
    vi.stubGlobal('window', { isSecureContext: false })
    expect(webBluetoothAdapter.isSupported()).toBe(false)
  })
})

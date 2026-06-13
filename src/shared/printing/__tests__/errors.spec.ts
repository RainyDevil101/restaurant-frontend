import { describe, it, expect } from 'vitest'
import { printerErrorMessage } from '../errors'

describe('printerErrorMessage', () => {
  it('maps NotFoundError DOMException to the no-printer-selected message', () => {
    const err = new DOMException('no device', 'NotFoundError')
    expect(printerErrorMessage(err)).toBe('No se seleccionó ninguna impresora.')
  })

  it('maps NotAllowedError DOMException to the access-denied message', () => {
    const err = new DOMException('denied', 'NotAllowedError')
    expect(printerErrorMessage(err)).toBe('El navegador denegó el acceso a la impresora.')
  })

  it('maps SecurityError DOMException to the blocked message', () => {
    const err = new DOMException('blocked', 'SecurityError')
    expect(printerErrorMessage(err)).toBe('El navegador bloqueó el acceso a la impresora.')
  })

  it('maps NetworkError DOMException to the connection-failed message', () => {
    const err = new DOMException('net', 'NetworkError')
    expect(printerErrorMessage(err)).toBe('No se pudo establecer la conexión con la impresora.')
  })

  it('maps InvalidStateError DOMException to the invalid-state message', () => {
    const err = new DOMException('state', 'InvalidStateError')
    expect(printerErrorMessage(err)).toBe(
      'La impresora quedó en un estado inválido. Reconectala e intentá de nuevo.',
    )
  })

  it('falls back to the generic message for an unknown DOMException name', () => {
    const err = new DOMException('weird', 'AbortError')
    expect(printerErrorMessage(err)).toBe('No se pudo conectar con la impresora.')
  })

  it('returns the message of a plain Error', () => {
    expect(printerErrorMessage(new Error('boom'))).toBe('boom')
  })

  it('returns the generic message for a non-error value', () => {
    expect(printerErrorMessage('just a string')).toBe('No se pudo conectar con la impresora.')
    expect(printerErrorMessage(null)).toBe('No se pudo conectar con la impresora.')
    expect(printerErrorMessage(undefined)).toBe('No se pudo conectar con la impresora.')
  })
})

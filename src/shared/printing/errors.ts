export function printerErrorMessage(err: unknown): string {
  if (err instanceof DOMException) {
    switch (err.name) {
      case 'NotFoundError':
        return 'No se seleccionó ninguna impresora.'
      case 'NotAllowedError':
        return 'El navegador denegó el acceso a la impresora.'
      case 'SecurityError':
        return 'El navegador bloqueó el acceso a la impresora.'
      case 'NetworkError':
        return 'No se pudo establecer la conexión con la impresora.'
      case 'InvalidStateError':
        return 'La impresora quedó en un estado inválido. Reconectala e intentá de nuevo.'
      default:
        return 'No se pudo conectar con la impresora.'
    }
  }
  if (err instanceof Error) return err.message
  return 'No se pudo conectar con la impresora.'
}

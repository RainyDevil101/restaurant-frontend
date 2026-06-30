export const SERVICE_LABELS = {
  tableSelection: {
    legendAria: 'Estado de mesas',
    empty: 'No hay mesas registradas.',
  },
  tableCard: {
    pendingDeliveryAria: 'Pedidos por entregar',
    pendingDelivery: 'Por entregar',
    peopleSuffix: 'pers.',
    orderSingular: 'pedido',
    orderPlural: 'pedidos',
  },
  layout: {
    backToAdminAria: 'Volver a administración',
    admin: 'Admin',
    openManualAria: 'Abrir manual',
    logoutShort: 'Salir',
  },
  orderHeader: {
    title: 'Nuevo pedido',
  },
  order: {
    tableFallback: 'Mesa',
    tableGenericFallback: 'la mesa',
  },
  catalog: {
    searchAria: 'Buscar producto',
    searchPlaceholder: 'Buscar producto...',
    clearSearchAria: 'Limpiar búsqueda',
    noResults: 'Sin resultados.',
    combos: 'Combos',
  },
  productRow: {
    disabled: 'Desactivado',
  },
  itemRow: {
    removeOneAria: 'Quitar uno',
    addOneAria: 'Agregar uno',
  },
  entryActions: {
    addAria: (name: string) => `Agregar ${name}`,
    addAnotherAria: (name: string) => `Agregar otro ${name}`,
    removeOneOfAria: (name: string) => `Quitar uno de ${name}`,
  },
  summary: {
    title: 'Pedido de la mesa',
  },
  inProgress: {
    title: 'Cuenta de la mesa',
    deliveredPendingSuffix: ' · pendiente de cobro',
    marking: 'Marcando…',
    markDelivered: 'Marcar entregado',
  },
  submitBar: {
    sending: 'Enviando…',
    submit: 'Enviar a caja',
  },
  items: {
    singular: 'ítem',
    plural: 'ítems',
  },
  leaveDialog: {
    title: '¿Salir sin enviar?',
    confirm: 'Descartar y salir',
    saving: 'Saliendo…',
    body: (tableName: string) =>
      `Tienes un pedido sin enviar para la ${tableName}. Si sales, se perderán los productos seleccionados.`,
  },
  removeDialog: {
    title: '¿Quitar producto?',
    confirm: 'Quitar',
    bodyPrefix: 'Se quitará ',
    bodySuffix: (tableName: string) => ` del pedido de la ${tableName}.`,
  },
} as const;

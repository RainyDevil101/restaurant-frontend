export const PRODUCT_PRICE_MAX = 99_999_999
export const TABLE_CAPACITY_MAX = 20

export const PRODUCTS_PER_PAGE = 10
export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const

export const ADMIN_LABELS = {
  product: {
    nameRequired: 'El nombre del producto es obligatorio.',
    categoryPlaceholder: 'Seleccione una categoría',
    categoryRequired: 'Selecciona una categoría para continuar.',
    noCategoriesNotice: 'No hay categorías disponibles.',
    noCategoriesHint: 'Crea una categoría para poder agregar productos.',
    createCategoryLabel: 'Crear',
    createCategorySection: 'Crear nueva categoría',
    categoryNamePlaceholder: 'Nombre de la categoría',
    creating: 'Creando…',
    priceInvalid: 'El precio debe ser un número entero entre $0 y $99.999.999.',
  },
  user: {
    nameRequired: 'El nombre del usuario es obligatorio.',
    emailRequired: 'El correo electrónico es obligatorio.',
    emailInvalid: 'Ingresa un correo electrónico válido.',
    credentialRequired: 'La contraseña o PIN es obligatorio para usuarios nuevos.',
  },
  table: {
    nameRequired: 'El nombre de la mesa es obligatorio.',
    areaRequired: 'Selecciona un área para la mesa.',
    capacityInvalid: 'La capacidad debe ser un número entero entre 1 y 20.',
    statusLabels: {
      libre:     { label: 'Libre',     color: '#059669' },
      ocupada:   { label: 'Ocupada',   color: '#1D4ED8' },
      por_cobrar: { label: 'Por cobrar', color: '#D97706' },
    } as Record<string, { label: string; color: string }>,
  },
  area: {
    nameRequired: 'El nombre del área es obligatorio.',
    deleteBlockedTitle: 'No se puede eliminar: esta área tiene mesas asociadas. Elimina las mesas primero.',
  },
  menu: {
    nameRequired: 'El nombre del menú es obligatorio.',
    productsRequired: 'Selecciona al menos un producto para el menú.',
    priceInvalid: 'El precio debe ser un número entero entre $0 y $99.999.999.',
  },
  category: {
    nameRequired: 'El nombre de la categoría es obligatorio.',
    deleteBlockedTitle: 'No se puede eliminar: esta categoría tiene productos asociados. Elimina o reasigna los productos primero.',
  },
} as const

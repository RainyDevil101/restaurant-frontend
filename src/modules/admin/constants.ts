import type { BadgeTone } from '@/shared/components/Badge.vue';

export const PRODUCT_PRICE_MAX = 999_999;
export const TABLE_CAPACITY_MAX = 20;

export const PRODUCTS_PER_PAGE = 10;
export const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

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
    priceInvalid: 'El precio debe ser un número entero entre $0 y $999.999.',
  },
  user: {
    nameRequired: 'El nombre del usuario es obligatorio.',
    emailRequired: 'El correo electrónico es obligatorio.',
    emailInvalid: 'Ingresa un correo electrónico válido.',
    credentialRequired: 'El PIN es obligatorio para usuarios nuevos.',
    credentialInvalid: 'El PIN debe ser de 6 dígitos numéricos.',
  },
  table: {
    nameRequired: 'El nombre de la mesa es obligatorio.',
    capacityInvalid: 'La capacidad debe ser un número entero entre 1 y 20.',
    statusLabels: {
      libre: { label: 'Libre', tone: 'green' },
      ocupada: { label: 'Ocupada', tone: 'blue' },
      por_cobrar: { label: 'Por cobrar', tone: 'amber' },
    } as Record<string, { label: string; tone: BadgeTone }>,
  },
  area: {
    nameRequired: 'El nombre del área es obligatorio.',
    deleteBlockedTitle:
      'No se puede eliminar: esta área tiene categorías asociadas. Elimina o reasigna las categorías primero.',
  },
  menu: {
    nameRequired: 'El nombre del menú es obligatorio.',
    productsRequired: 'Selecciona al menos un producto para el menú.',
    priceInvalid: 'El precio debe ser un número entero entre $0 y $999.999.',
  },
  category: {
    nameRequired: 'El nombre de la categoría es obligatorio.',
    areaRequired: 'Selecciona un área para la categoría.',
    deleteBlockedTitle:
      'No se puede eliminar: esta categoría tiene productos asociados. Elimina o reasigna los productos primero.',
  },
} as const;

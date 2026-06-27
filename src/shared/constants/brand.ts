export const BRAND = 'Subito';
export const BRAND_TAGLINE = 'Gestión de pedidos';

export const DEFAULT_TITLE = `${BRAND} — ${BRAND_TAGLINE}`;

export function brandTitle(title?: string): string {
  return title ? `${title} · ${BRAND}` : DEFAULT_TITLE;
}

export const ROUTE_TITLES = {
  MESAS: 'Mesas',
  TOMAR_PEDIDO: 'Tomar pedido',
  CAJA: 'Caja',
  CUENTA: 'Cuenta',
  COBRO: 'Cobro',
  PRODUCTOS: 'Productos',
  CATEGORIAS: 'Categorías',
  MENUS: 'Menús',
  AREAS: 'Áreas',
  USUARIOS: 'Usuarios',
  PAGOS: 'Pagos',
  CONFIGURACION: 'Configuración',
  MANUAL: 'Manual',
} as const;

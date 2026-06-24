// Subito brand identity — single source of truth for the product name,
// tagline, and the per-route document titles shown in the browser tab.

export const BRAND = 'Subito';
export const BRAND_TAGLINE = 'Gestión de pedidos';

// Shown when a route declares no title (e.g. the login screen).
export const DEFAULT_TITLE = `${BRAND} — ${BRAND_TAGLINE}`;

// Builds the tab title for a route: "Mesas · Subito".
export function brandTitle(title?: string): string {
  return title ? `${title} · ${BRAND}` : DEFAULT_TITLE;
}

// Per-view titles. Reused across modules where the concept matches
// (e.g. MESAS is both the service home and the admin tables view).
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

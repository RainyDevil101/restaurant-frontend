export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
  },
  catalog: {
    stamp: '/catalog/stamp',
  },
  products: {
    root: '/products',
    byId: (id: string) => `/products/${encodeURIComponent(id)}`,
    availability: (id: string) => `/products/${encodeURIComponent(id)}/availability`,
  },
  categories: {
    root: '/categories',
    byId: (id: string) => `/categories/${encodeURIComponent(id)}`,
  },
  menus: {
    root: '/menus',
    byId: (id: string) => `/menus/${encodeURIComponent(id)}`,
    active: (id: string) => `/menus/${encodeURIComponent(id)}/active`,
  },
  areas: {
    root: '/areas',
    byId: (id: string) => `/areas/${encodeURIComponent(id)}`,
  },
  tables: {
    root: '/tables',
    byId: (id: string) => `/tables/${encodeURIComponent(id)}`,
    status: (id: string) => `/tables/${encodeURIComponent(id)}/status`,
  },
  users: {
    root: '/users',
    byId: (id: string) => `/users/${encodeURIComponent(id)}`,
  },
  orders: {
    root: '/orders',
    byTable: (id: string) => `/orders/table/${encodeURIComponent(id)}`,
    status: (id: string) => `/orders/${encodeURIComponent(id)}/status`,
    cancel: (id: string) => `/orders/${encodeURIComponent(id)}/cancel`,
    comandasByTable: (id: string) => `/orders/table/${encodeURIComponent(id)}/comandas`,
  },
  billing: {
    payments: '/billing/payments',
    paymentReceipt: (id: string) => `/billing/payments/${encodeURIComponent(id)}/receipt`,
    paymentComanda: (id: string) => `/billing/payments/${encodeURIComponent(id)}/comanda`,
    table: (id: string) => `/billing/table/${encodeURIComponent(id)}`,
    precheck: (id: string) => `/billing/table/${encodeURIComponent(id)}/precheck`,
    consolidate: (id: string) => `/billing/table/${encodeURIComponent(id)}/consolidate`,
    payment: (id: string) => `/billing/table/${encodeURIComponent(id)}/payment`,
  },
  settings: {
    printers: '/settings/printers',
    printerById: (id: string) => `/settings/printers/${encodeURIComponent(id)}`,
    receipt: '/settings/receipt',
  },
} as const;

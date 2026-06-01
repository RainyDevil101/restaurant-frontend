import type { Role } from './store'

export const ROLES = {
  WAITER: 'M' as Role,
  CASHIER: 'C' as Role,
  ADMIN: 'A' as Role,
} as const

export const ROLE_GROUPS = {
  SERVICE: [ROLES.WAITER, ROLES.ADMIN] satisfies Role[],
  CHECKOUT: [ROLES.CASHIER, ROLES.ADMIN] satisfies Role[],
  ADMIN: [ROLES.ADMIN] satisfies Role[],
} as const

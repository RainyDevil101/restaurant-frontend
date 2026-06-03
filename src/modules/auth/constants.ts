import { Role } from '@/shared/types'

export { Role }

export const ROLE_GROUPS = {
  SERVICE: [Role.MESERO, Role.ADMIN] as Role[],
  CHECKOUT: [Role.CAJERO, Role.ADMIN] as Role[],
  ADMIN: [Role.ADMIN] as Role[],
} as const

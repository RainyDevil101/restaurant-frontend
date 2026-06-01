import type { Role } from '@/modules/auth/store'

interface RoleBadge {
  label: string
  bg: string
  color: string
}

const ROLE_BADGES: Record<Role, RoleBadge> = {
  M: { label: 'Servicio',       bg: '#DBEAFE', color: '#1D4ED8' },
  C: { label: 'Caja',           bg: '#EDE9FE', color: '#6D28D9' },
  A: { label: 'Administración', bg: '#F3F4F6', color: '#374151' },
}

export function roleLabel(role: Role): RoleBadge {
  return ROLE_BADGES[role]
}

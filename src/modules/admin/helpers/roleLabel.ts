import { Role } from '@/shared/types'
import { colors } from '@/shared/styles/colors'

interface RoleBadge {
  label: string
  bg: string
  color: string
}

const ROLE_BADGES: Record<Role, RoleBadge> = {
  [Role.MESERO]: { label: 'Servicio',       bg: colors.table.occupied.bg,       color: colors.table.occupied.text       },
  [Role.CAJERO]: { label: 'Caja',           bg: colors.area.bar.bg,             color: colors.area.bar.text             },
  [Role.ADMIN]:  { label: 'Administración', bg: colors.neutral.surface,         color: colors.neutral.secondary         },
}

export function roleLabel(role: Role): RoleBadge {
  return ROLE_BADGES[role]
}

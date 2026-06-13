import { Role } from '@/shared/types';
import type { BadgeTone } from '@/shared/components/Badge.vue';

interface RoleBadge {
  label: string;
  tone: BadgeTone;
}

const ROLE_BADGES: Record<Role, RoleBadge> = {
  [Role.MESERO]: { label: 'Servicio', tone: 'blue' },
  [Role.CAJERO]: { label: 'Caja', tone: 'purple' },
  [Role.ADMIN]: { label: 'Administración', tone: 'gray' },
};

export function roleLabel(role: Role): RoleBadge {
  return ROLE_BADGES[role];
}

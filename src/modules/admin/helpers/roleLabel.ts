import type { Role } from '@/shared/types';
import { ROLE_LABEL, type BadgeLabel } from '@/shared/constants/labels';

export function roleLabel(role: Role): BadgeLabel {
  return ROLE_LABEL[role];
}

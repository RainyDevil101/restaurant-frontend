import { Role } from '@/shared/types';

export { Role };

export const ROLE_GROUPS = {
  SERVICE: [Role.MESERO, Role.ADMIN] as Role[],
  CHECKOUT: [Role.CAJERO, Role.ADMIN] as Role[],
  ADMIN: [Role.ADMIN] as Role[],
} as const;

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PIN_LENGTH = 6;

export const LOGIN_LABELS = {
  pinLabel: 'PIN',
  errorFieldsRequired: 'Ingresa tu correo y PIN.',
  errorEmailInvalid: 'Ingresa un correo electrónico válido.',
  errorPinIncomplete: 'El PIN debe tener 6 dígitos.',
  errorInvalidCredentials: 'Credenciales incorrectas.',
  errorNetwork: 'No se pudo conectar con el servidor.',
} as const;

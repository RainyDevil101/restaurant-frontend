import { Role } from '@/shared/types';
import { EMAIL_RE, PIN_LENGTH } from '@/shared/constants/validation';

export { Role };
export { EMAIL_RE, PIN_LENGTH };

export const ROLE_GROUPS = {
  SERVICE: [Role.MESERO, Role.ADMIN] as Role[],
  CHECKOUT: [Role.CAJERO, Role.ADMIN] as Role[],
  ADMIN: [Role.ADMIN] as Role[],
} as const;

export const LOGIN_LABELS = {
  pinLabel: 'PIN',
  emailLabel: 'Correo',
  emailPlaceholder: 'nombre@restaurante.cl',
  submit: 'Ingresar',
  submitting: 'Ingresando…',
  backspaceAria: 'Borrar',
  submitAria: 'Ingresar',
  backspaceGlyph: '⌫',
  submitGlyph: '↵',
  errorFieldsRequired: 'Ingresa tu correo y PIN.',
  errorEmailInvalid: 'Ingresa un correo electrónico válido.',
  errorPinIncomplete: `El PIN debe tener ${PIN_LENGTH} dígitos.`,
  errorInvalidCredentials: 'Credenciales incorrectas.',
  errorNetwork: 'No se pudo conectar con el servidor.',
} as const;

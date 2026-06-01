import type { User } from '@/modules/auth/store'
import { ROLES } from '@/modules/auth/constants'

export const mockUsers: User[] = [
  { id: 'user-1', name: 'Ana',    email: 'ana@subito.mx',    role: ROLES.WAITER,  active: true  },
  { id: 'user-2', name: 'Carlos', email: 'carlos@subito.mx', role: ROLES.CASHIER, active: true  },
  { id: 'user-3', name: 'Roberto',email: 'admin@subito.mx',  role: ROLES.ADMIN,   active: true  },
  { id: 'user-4', name: 'Pedro',  email: 'pedro@subito.mx',  role: ROLES.WAITER,  active: false },
]

// Dev-only plaintext credentials — production stores bcrypt hashes for both passwords and PINs
export const MOCK_CREDENTIALS: Record<string, string> = {
  'ana@subito.mx':    '1234',
  'carlos@subito.mx': '1234',
  'admin@subito.mx':  'admin',
  'pedro@subito.mx':  '5678',
}

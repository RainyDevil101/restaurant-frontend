import { describe, it, expect } from 'vitest'
import { roleLabel } from '../roleLabel'
import { Role } from '@/shared/types'

describe('roleLabel', () => {
  it('returns Servicio with blue tone for mesero', () => {
    expect(roleLabel(Role.MESERO)).toEqual({ label: 'Servicio', tone: 'blue' })
  })

  it('returns Caja with purple tone for cajero', () => {
    expect(roleLabel(Role.CAJERO)).toEqual({ label: 'Caja', tone: 'purple' })
  })

  it('returns Administración with gray tone for admin', () => {
    expect(roleLabel(Role.ADMIN)).toEqual({ label: 'Administración', tone: 'gray' })
  })
})

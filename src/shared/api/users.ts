import { api } from './client'
import type { User, Role } from '@/modules/auth/store'

export interface CreateUserInput {
  name: string
  email: string
  role: Role
  credential: string
}

export interface UpdateUserInput {
  name?: string
  email?: string
  role?: Role
  active?: boolean
  credential?: string
}

export function listUsers(): Promise<User[]> {
  return api.get<User[]>('/users')
}

export function createUser(input: CreateUserInput): Promise<User> {
  return api.post<User>('/users', input)
}

export function updateUser(id: string, input: UpdateUserInput): Promise<User> {
  return api.patch<User>(`/users/${id}`, input)
}

export function deactivateUser(id: string): Promise<void> {
  return api.delete<void>(`/users/${id}`)
}

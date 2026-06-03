import { api } from '@/shared/api/client'
import type { User } from './store'

interface LoginResponse {
  accessToken: string
  tokenType: string
  user: User
}

export function requestLogin(email: string, credential: string): Promise<LoginResponse> {
  return api.post<LoginResponse>('/auth/login', { email, credential }, false)
}

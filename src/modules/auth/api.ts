import { api } from '@/shared/api/client';
import { ENDPOINTS } from '@/shared/api/endpoints';
import type { User } from './store';

interface LoginResponse {
  accessToken: string;
  tokenType: string;
  user: User;
}

export function requestLogin(email: string, credential: string): Promise<LoginResponse> {
  return api.post<LoginResponse>(ENDPOINTS.auth.login, { email, credential }, false);
}

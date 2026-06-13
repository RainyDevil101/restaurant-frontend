import type { User } from '@/modules/auth/store';

const SESSION_KEY = 'subito.session';

export interface PersistedSession {
  token: string;
  user: User;
}

export function loadSession(): PersistedSession | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PersistedSession;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

export function saveSession(session: PersistedSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getToken(): string | null {
  return loadSession()?.token ?? null;
}

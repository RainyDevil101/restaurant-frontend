import { describe, it, expect, beforeEach } from 'vitest';
import { loadSession, saveSession, clearSession, getToken } from '@/shared/session';
import { Role } from '@/shared/types';

const mockSession = {
  token: 'test-jwt',
  user: {
    id: 'u1',
    name: 'Ana',
    email: 'ana@subito.mx',
    role: Role.MESERO,
    active: true,
    isOwner: false,
  },
};

describe('session', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loadSession returns null when no session exists', () => {
    expect(loadSession()).toBeNull();
  });

  it('saveSession persists and loadSession retrieves the session', () => {
    saveSession(mockSession);
    expect(loadSession()).toEqual(mockSession);
  });

  it('clearSession removes the session', () => {
    saveSession(mockSession);
    clearSession();
    expect(loadSession()).toBeNull();
  });

  it('getToken returns null without a saved session', () => {
    expect(getToken()).toBeNull();
  });

  it('getToken returns the token after saving', () => {
    saveSession(mockSession);
    expect(getToken()).toBe('test-jwt');
  });

  it('loadSession removes corrupted JSON and returns null', () => {
    localStorage.setItem('subito.session', 'not-valid-json{');
    expect(loadSession()).toBeNull();
    expect(localStorage.getItem('subito.session')).toBeNull();
  });
});

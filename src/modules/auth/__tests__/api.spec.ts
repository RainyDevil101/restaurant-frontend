import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Role } from '@/shared/types';

vi.mock('@/shared/api/client', () => ({
  api: {
    post: vi.fn<typeof import('@/shared/api/client').api.post>(),
  },
}));

import { api } from '@/shared/api/client';
import { requestLogin } from '../api';

const loginResponse = {
  accessToken: 'jwt-token',
  tokenType: 'Bearer',
  user: {
    id: 'u1',
    name: 'Ana',
    email: 'ana@subito.mx',
    role: Role.MESERO,
    active: true,
    isOwner: false,
  },
};

describe('requestLogin', () => {
  beforeEach(() => {
    vi.mocked(api.post).mockReset();
  });

  it('posts { email, credential } to /auth/login with auth disabled', async () => {
    vi.mocked(api.post).mockResolvedValue(loginResponse);

    await requestLogin('ana@subito.mx', '1234');

    expect(api.post).toHaveBeenCalledWith(
      '/auth/login',
      { email: 'ana@subito.mx', credential: '1234' },
      false,
    );
  });

  it('returns the { accessToken, tokenType, user } response', async () => {
    vi.mocked(api.post).mockResolvedValue(loginResponse);

    const result = await requestLogin('ana@subito.mx', '1234');

    expect(result).toEqual(loginResponse);
  });

  it('propagates a rejection from the API', async () => {
    vi.mocked(api.post).mockRejectedValue(new Error('boom'));

    await expect(requestLogin('ana@subito.mx', '1234')).rejects.toThrow('boom');
  });
});

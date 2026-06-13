import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import { setActivePinia, createPinia } from 'pinia';
import { Role, Route } from '@/shared/types';
import { ApiRequestError } from '@/shared/api/client';
import { LOGIN_LABELS } from '../../constants';

vi.mock('../../api', () => ({
  requestLogin: vi.fn<typeof import('../../api').requestLogin>(),
}));

const push = vi.fn<(to: string) => void>();
vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
}));

import { requestLogin } from '../../api';
import { useLogin } from '../useLogin';

const makeUser = (role: Role) => ({
  id: 'u1',
  name: 'Ana',
  email: 'ana@subito.mx',
  role,
  active: true,
  isOwner: false,
});

async function withSetup(): Promise<ReturnType<typeof useLogin>> {
  let result!: ReturnType<typeof useLogin>;
  mount(
    defineComponent({
      setup() {
        result = useLogin();
        return () => h('div');
      },
    }),
  );
  await flushPromises();
  return result;
}

describe('useLogin', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
    push.mockReset();
    vi.mocked(requestLogin).mockReset();
  });

  it('successful login stores the session and redirects to the role home', async () => {
    vi.mocked(requestLogin).mockResolvedValue({
      accessToken: 'tok-123',
      tokenType: 'Bearer',
      user: makeUser(Role.MESERO),
    });
    const { email, credential, submit } = await withSetup();
    email.value = 'ana@subito.mx';
    credential.value = '1234';

    await submit();
    await flushPromises();

    expect(requestLogin).toHaveBeenCalledWith('ana@subito.mx', '1234');
    expect(localStorage.getItem('subito.session')).not.toBeNull();
    expect(push).toHaveBeenCalledWith(Route.SERVICE);
  });

  it('redirects cajero to the checkout home', async () => {
    vi.mocked(requestLogin).mockResolvedValue({
      accessToken: 'tok-123',
      tokenType: 'Bearer',
      user: makeUser(Role.CAJERO),
    });
    const { email, credential, submit } = await withSetup();
    email.value = 'carlos@subito.mx';
    credential.value = 'secret';

    await submit();
    await flushPromises();

    expect(push).toHaveBeenCalledWith(Route.CHECKOUT);
  });

  it('lowercases and trims the email before submitting', async () => {
    vi.mocked(requestLogin).mockResolvedValue({
      accessToken: 'tok-123',
      tokenType: 'Bearer',
      user: makeUser(Role.ADMIN),
    });
    const { email, credential, submit } = await withSetup();
    email.value = '  Admin@Subito.MX  ';
    credential.value = 'admin';

    await submit();
    await flushPromises();

    expect(requestLogin).toHaveBeenCalledWith('admin@subito.mx', 'admin');
  });

  it('toggles loading during submit and resets it after', async () => {
    let resolveLogin!: (value: Awaited<ReturnType<typeof requestLogin>>) => void;
    vi.mocked(requestLogin).mockReturnValue(
      new Promise((resolve) => {
        resolveLogin = resolve;
      }),
    );
    const { email, credential, loading, submit } = await withSetup();
    email.value = 'ana@subito.mx';
    credential.value = '1234';

    const pending = submit();
    expect(loading.value).toBe(true);

    resolveLogin({ accessToken: 'tok', tokenType: 'Bearer', user: makeUser(Role.MESERO) });
    await pending;
    await flushPromises();

    expect(loading.value).toBe(false);
  });

  it('surfaces an invalid-credentials error on a 401 and does not persist a session', async () => {
    vi.mocked(requestLogin).mockRejectedValue(new ApiRequestError('Unauthorized', 401, null));
    const { email, credential, error, submit } = await withSetup();
    email.value = 'ana@subito.mx';
    credential.value = 'wrong';

    await submit();
    await flushPromises();

    expect(error.value).toBe(LOGIN_LABELS.errorInvalidCredentials);
    expect(localStorage.getItem('subito.session')).toBeNull();
    expect(push).not.toHaveBeenCalled();
  });

  it('surfaces the server message on a non-401 ApiRequestError', async () => {
    vi.mocked(requestLogin).mockRejectedValue(new ApiRequestError('Server exploded', 500, null));
    const { email, credential, error, submit } = await withSetup();
    email.value = 'ana@subito.mx';
    credential.value = '1234';

    await submit();
    await flushPromises();

    expect(error.value).toBe('Server exploded');
    expect(push).not.toHaveBeenCalled();
  });

  it('surfaces a network error when the failure is not an ApiRequestError', async () => {
    vi.mocked(requestLogin).mockRejectedValue(new TypeError('Failed to fetch'));
    const { email, credential, error, submit } = await withSetup();
    email.value = 'ana@subito.mx';
    credential.value = '1234';

    await submit();
    await flushPromises();

    expect(error.value).toBe(LOGIN_LABELS.errorNetwork);
    expect(push).not.toHaveBeenCalled();
  });

  it('rejects submit with empty fields without calling the API', async () => {
    const { error, submit } = await withSetup();

    await submit();

    expect(error.value).toBe(LOGIN_LABELS.errorFieldsRequired);
    expect(requestLogin).not.toHaveBeenCalled();
  });

  it('rejects submit when the credential is empty', async () => {
    const { email, error, submit } = await withSetup();
    email.value = 'ana@subito.mx';

    await submit();

    expect(error.value).toBe(LOGIN_LABELS.errorFieldsRequired);
    expect(requestLogin).not.toHaveBeenCalled();
  });

  it('rejects a malformed email without calling the API', async () => {
    const { email, credential, error, submit } = await withSetup();
    email.value = 'not-an-email';
    credential.value = '1234';

    await submit();

    expect(error.value).toBe(LOGIN_LABELS.errorEmailInvalid);
    expect(requestLogin).not.toHaveBeenCalled();
  });

  it('clears a previous error on a fresh successful submit', async () => {
    vi.mocked(requestLogin)
      .mockRejectedValueOnce(new ApiRequestError('Unauthorized', 401, null))
      .mockResolvedValueOnce({
        accessToken: 'tok',
        tokenType: 'Bearer',
        user: makeUser(Role.MESERO),
      });
    const { email, credential, error, submit } = await withSetup();
    email.value = 'ana@subito.mx';
    credential.value = 'wrong';
    await submit();
    await flushPromises();
    expect(error.value).toBe(LOGIN_LABELS.errorInvalidCredentials);

    credential.value = '1234';
    await submit();
    await flushPromises();
    expect(error.value).toBe('');
  });
});

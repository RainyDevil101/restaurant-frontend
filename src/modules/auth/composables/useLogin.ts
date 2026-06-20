import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store';
import { requestLogin } from '../api';
import { ApiRequestError } from '@/shared/api/client';
import { EMAIL_RE, LOGIN_LABELS, PIN_LENGTH } from '../constants';

export function useLogin() {
  const router = useRouter();
  const authStore = useAuthStore();

  const email = ref('');
  const pin = ref('');
  const error = ref('');
  const loading = ref(false);

  const pinComplete = computed(() => pin.value.length === PIN_LENGTH);

  function pressDigit(digit: string) {
    if (loading.value || pin.value.length >= PIN_LENGTH) return;
    pin.value += digit;
    // Auto-submit once the PIN is complete for the fastest possible login.
    if (pin.value.length === PIN_LENGTH) void submit();
  }

  function backspace() {
    if (loading.value) return;
    pin.value = pin.value.slice(0, -1);
  }

  function clearPin() {
    pin.value = '';
  }

  async function submit() {
    error.value = '';

    const trimmedEmail = email.value.trim().toLowerCase();
    if (!trimmedEmail || !pin.value) {
      error.value = LOGIN_LABELS.errorFieldsRequired;
      return;
    }
    if (!EMAIL_RE.test(trimmedEmail)) {
      error.value = LOGIN_LABELS.errorEmailInvalid;
      return;
    }
    if (pin.value.length !== PIN_LENGTH) {
      error.value = LOGIN_LABELS.errorPinIncomplete;
      return;
    }

    loading.value = true;
    try {
      const { accessToken, user } = await requestLogin(trimmedEmail, pin.value);
      authStore.login(user, accessToken);
      router.push(authStore.roleHome);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        error.value = err.statusCode === 401 ? LOGIN_LABELS.errorInvalidCredentials : err.message;
      } else {
        error.value = LOGIN_LABELS.errorNetwork;
      }
      clearPin();
    } finally {
      loading.value = false;
    }
  }

  return {
    email,
    pin,
    error,
    loading,
    pinComplete,
    pinLength: PIN_LENGTH,
    pinLabel: LOGIN_LABELS.pinLabel,
    pressDigit,
    backspace,
    clearPin,
    submit,
  };
}

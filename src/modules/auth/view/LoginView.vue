<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useLogin } from '../composables/useLogin';
import BrandLogo from '@/shared/components/BrandLogo.vue';
import { colors } from '@/shared/styles/colors';

const { email, pin, pinLength, pinLabel, error, loading, pressDigit, backspace, submit } =
  useLogin();

const digitKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

// Physical keyboard support (fast for desktop admin/checkout).
function onKeydown(e: KeyboardEvent) {
  const target = e.target as HTMLElement | null;
  const typingEmail = target?.tagName === 'INPUT';
  if (typingEmail) {
    if (e.key === 'Enter') submit();
    return;
  }
  if (e.key >= '0' && e.key <= '9') {
    pressDigit(e.key);
  } else if (e.key === 'Backspace') {
    e.preventDefault();
    backspace();
  } else if (e.key === 'Enter') {
    submit();
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown));
onUnmounted(() => window.removeEventListener('keydown', onKeydown));
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <!-- Brand -->
      <div class="brand">
        <BrandLogo size="2rem" tagline />
      </div>

      <!-- Form -->
      <form class="form" novalidate @submit.prevent="submit">
        <div class="field-group">
          <label class="field-label" for="email">Correo</label>
          <input
            id="email"
            v-model="email"
            class="field-input"
            type="email"
            inputmode="email"
            placeholder="nombre@restaurante.cl"
            autocomplete="email"
            required
          />
        </div>

        <div class="field-group">
          <span class="field-label">{{ pinLabel }}</span>

          <!-- PIN progress dots -->
          <div class="pin-dots" aria-hidden="true">
            <span
              v-for="i in pinLength"
              :key="i"
              class="pin-dot"
              :class="{ filled: pin.length >= i }"
            />
          </div>

          <!-- On-screen numeric keypad -->
          <div class="keypad">
            <button
              v-for="key in digitKeys"
              :key="key"
              type="button"
              class="key"
              :disabled="loading"
              @click="pressDigit(key)"
            >
              {{ key }}
            </button>
            <button
              type="button"
              class="key key-muted"
              :disabled="loading || pin.length === 0"
              aria-label="Borrar"
              @click="backspace"
            >
              ⌫
            </button>
            <button type="button" class="key" :disabled="loading" @click="pressDigit('0')">
              0
            </button>
            <button type="submit" class="key key-primary" :disabled="loading" aria-label="Ingresar">
              ↵
            </button>
          </div>
        </div>

        <p v-if="error" class="error-msg" role="alert">{{ error }}</p>

        <button type="submit" class="submit-btn" :disabled="loading">
          {{ loading ? 'Ingresando…' : 'Ingresar' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: linear-gradient(145deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
}

.login-card {
  width: 100%;
  max-width: 380px;
  background: white;
  border-radius: 18px;
  padding: 2.25rem 2rem;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

/* Brand */
.brand {
  text-align: center;
}

/* Form */
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.field-input {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.975rem;
  color: #111827;
  font-family: inherit;
  transition: border-color 0.15s;
  background: white;
}

.field-input:focus {
  border-color: var(--color-primary);
}

.field-input::placeholder {
  color: v-bind('colors.neutral.mutedText');
}

/* PIN dots */
.pin-dots {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 6px 0 10px;
}

.pin-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #d1d5db;
  background: transparent;
  transition:
    background 0.12s,
    border-color 0.12s;
}

.pin-dot.filled {
  background: var(--color-primary);
  border-color: var(--color-primary);
}

/* Keypad */
.keypad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.key {
  padding: 14px 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  background: #f3f4f6;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition:
    background 0.12s,
    transform 0.06s;
  user-select: none;
}

.key:hover:not(:disabled) {
  background: #e5e7eb;
}

.key:active:not(:disabled) {
  transform: scale(0.96);
}

.key:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.key-muted {
  color: #6b7280;
  font-size: 1.4rem;
}

.key-primary {
  background: var(--color-primary);
  color: white;
  font-size: 1.4rem;
}

.key-primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

/* Error */
.error-msg {
  font-size: 0.85rem;
  color: #dc2626;
  margin-top: -4px;
  text-align: center;
}

/* Submit */
.submit-btn {
  width: 100%;
  padding: 14px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  margin-top: 0.25rem;
  transition: background 0.15s;
}

.submit-btn:hover {
  background: var(--color-primary-dark);
}

.submit-btn:disabled {
  background: #c8d8d6;
  cursor: not-allowed;
}
</style>

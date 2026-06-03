<script setup lang="ts">
import { EyeSlashIcon } from '@/modules/shared/components/icons';
import { useLogin } from '../composables/useLogin'

const {
  email,
  credential,
  showCredential,
  credentialLabel,
  inputType,
  inputMode,
  error,
  loading,
  submit,
} = useLogin()
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <!-- Brand -->
      <div class="brand">
        <h1 class="brand-name">Subito</h1>
        <p class="brand-tagline">Gestión de pedidos</p>
      </div>

      <!-- Form -->
      <form class="form" novalidate @submit.prevent="submit">
        <div class="field-group">
          <label class="field-label" for="email">Correo</label>
          <input id="email" v-model="email" class="field-input" type="email" inputmode="email"
            placeholder="nombre@restaurante.cl" autocomplete="email" required />
        </div>

        <div class="field-group">
          <label class="field-label" for="credential">{{ credentialLabel }}</label>
          <div class="credential-wrap">
            <input id="credential" v-model="credential" class="field-input credential-input" :type="inputType"
              :inputmode="inputMode" :placeholder="credentialLabel === 'PIN' ? '••••' : '••••••••'"
              autocomplete="current-password" required />
            <button type="button" class="eye-btn" :aria-label="showCredential ? 'Ocultar' : 'Mostrar'"
              @click="showCredential = !showCredential">
              <EyeSlashIcon :show-credential="showCredential" />
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

.brand-name {
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-primary);
  letter-spacing: -0.02em;
  line-height: 1;
}

.brand-tagline {
  margin-top: 4px;
  font-size: 0.9rem;
  color: #9ca3af;
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
  outline: none;
  transition: border-color 0.15s;
  background: white;
}

.field-input:focus {
  border-color: var(--color-primary);
}

.field-input::placeholder {
  color: #9ca3af;
}

/* Credential field with eye toggle */
.credential-wrap {
  position: relative;
}

.credential-input {
  padding-right: 48px;
}

.eye-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9ca3af;
  padding: 4px;
  display: flex;
  align-items: center;
  transition: color 0.12s;
}

.eye-btn:hover {
  color: var(--color-primary);
}

/* Error */
.error-msg {
  font-size: 0.85rem;
  color: #dc2626;
  margin-top: -4px;
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

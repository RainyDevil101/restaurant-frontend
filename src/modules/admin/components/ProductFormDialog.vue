<script setup lang="ts">
import { computed } from 'vue'
import type { Ref } from 'vue'
import ModalDialog from './ModalDialog.vue'
import AdminFormField from './AdminFormField.vue'
import type { Area, Category } from '@/shared/types'
import { ADMIN_LABELS, PRODUCT_PRICE_MAX } from '../constants'

interface InlineCatState {
  creating: Ref<boolean>
  inputName: Ref<string>
  inputAreaId: Ref<string>
  error: Ref<string>
  submit: () => Promise<void>
}

interface ProductForm {
  name: string
  description: string
  price: number
  categoryId: string
}

const props = defineProps<{
  open: boolean
  editingId: string | null
  saving: boolean
  error: string
  form: ProductForm
  categories: Category[]
  areas: Area[]
  inlineCat: InlineCatState
}>()

const emit = defineEmits<{
  close: []
  submit: []
  'clamp-price': []
  'update:form': [patch: Partial<ProductForm>]
  'update:inlineCatInput': [value: string]
  'update:inlineCatArea': [value: string]
}>()

// Writable computed refs so v-model never mutates the prop directly
const formName = computed({
  get: () => props.form.name,
  set: (v: string) => emit('update:form', { name: v }),
})
const formDescription = computed({
  get: () => props.form.description,
  set: (v: string) => emit('update:form', { description: v }),
})
const formPrice = computed({
  get: () => props.form.price,
  set: (v: number) => emit('update:form', { price: v }),
})
const formCategoryId = computed({
  get: () => props.form.categoryId,
  set: (v: string) => emit('update:form', { categoryId: v }),
})

// Writable computed for the inline category input (avoids mutating prop ref directly)
const inlineCatInputName = computed({
  get: () => props.inlineCat.inputName.value,
  set: (v: string) => emit('update:inlineCatInput', v),
})

const inlineCatAreaId = computed({
  get: () => props.inlineCat.inputAreaId.value,
  set: (v: string) => emit('update:inlineCatArea', v),
})
</script>

<template>
  <ModalDialog
    v-if="props.open"
    :title="props.editingId ? 'Editar producto' : 'Nuevo producto'"
    :saving="props.saving"
    :error="props.error"
    @close="emit('close')"
    @submit="emit('submit')"
  >
    <AdminFormField label="Nombre" for="prod-name">
      <input id="prod-name" v-model="formName" class="field-input" required />
    </AdminFormField>
    <AdminFormField label="Descripción" for="prod-desc">
      <input id="prod-desc" v-model="formDescription" class="field-input" />
    </AdminFormField>
    <AdminFormField label="Precio" for="prod-price">
      <input
        id="prod-price"
        v-model.number="formPrice"
        class="field-input"
        type="number"
        min="0"
        :max="PRODUCT_PRICE_MAX"
        step="1"
        required
        @input="emit('clamp-price')"
      />
    </AdminFormField>
    <AdminFormField
      :label="'Categoría'"
      :for="props.categories.length === 0 && !props.editingId ? 'inline-cat-input' : 'prod-cat'"
    >
      <template v-if="props.categories.length === 0 && !props.editingId">
        <div class="no-cat-notice" role="alert">
          <span class="no-cat-title">{{ ADMIN_LABELS.product.noCategoriesNotice }}</span>
          <span class="no-cat-hint">{{ ADMIN_LABELS.product.noCategoriesHint }}</span>
        </div>
        <div class="inline-cat-form">
          <input
            id="inline-cat-input"
            v-model="inlineCatInputName"
            class="field-input inline-cat-input"
            :placeholder="ADMIN_LABELS.product.categoryNamePlaceholder"
            :disabled="props.inlineCat.creating.value"
          />
          <select
            v-model="inlineCatAreaId"
            class="field-input inline-cat-area"
            :disabled="props.inlineCat.creating.value"
          >
            <option value="" disabled>Área</option>
            <option v-for="a in props.areas" :key="a.id" :value="a.id">{{ a.name }}</option>
          </select>
          <button
            type="button"
            class="inline-cat-btn"
            :disabled="props.inlineCat.creating.value || !props.inlineCat.inputName.value.trim() || !props.inlineCat.inputAreaId.value"
            @click="props.inlineCat.submit()"
          >
            {{
              props.inlineCat.creating.value
                ? ADMIN_LABELS.product.creating
                : ADMIN_LABELS.product.createCategoryLabel
            }}
          </button>
        </div>
        <p v-if="props.inlineCat.error.value" class="inline-cat-error">
          {{ props.inlineCat.error.value }}
        </p>
      </template>
      <select v-else id="prod-cat" v-model="formCategoryId" class="field-input" required>
        <option value="" disabled>{{ ADMIN_LABELS.product.categoryPlaceholder }}</option>
        <option v-for="c in props.categories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
    </AdminFormField>
  </ModalDialog>
</template>

<style scoped>
/* No-categories notice */
.no-cat-notice {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 14px;
  background: #fffbeb;
  border: 1.5px solid #fcd34d;
  border-radius: 10px;
  margin-bottom: 10px;
}

.no-cat-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #92400e;
}

.no-cat-hint {
  font-size: 0.8rem;
  color: #b45309;
}

/* Inline category creation */
.inline-cat-form {
  display: flex;
  gap: 8px;
}

.inline-cat-input {
  flex: 1;
}

.inline-cat-area {
  flex-shrink: 0;
  width: 110px;
}

.inline-cat-btn {
  flex-shrink: 0;
  padding: 10px 16px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
  transition: background 0.15s;
}

.inline-cat-btn:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.inline-cat-btn:disabled {
  background: #c8d8d6;
  cursor: not-allowed;
}

.inline-cat-error {
  font-size: 0.8rem;
  color: #dc2626;
  margin-top: 4px;
}
</style>

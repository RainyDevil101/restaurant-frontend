<script setup lang="ts">
import { computed } from 'vue';
import type { Ref } from 'vue';
import ModalDialog from './ModalDialog.vue';
import AdminFormField from './AdminFormField.vue';
import type { Area, Category } from '@/shared/types';
import { ADMIN_LABELS, PRODUCT_PRICE_MAX } from '../constants';

interface InlineAreaState {
  creating: Ref<boolean>;
  inputName: Ref<string>;
  error: Ref<string>;
  submit: () => Promise<void>;
}

interface InlineCatState {
  creating: Ref<boolean>;
  inputName: Ref<string>;
  inputAreaId: Ref<string>;
  error: Ref<string>;
  submit: () => Promise<void>;
}

interface ProductForm {
  name: string;
  description: string;
  price: number;
  categoryId: string;
}

const props = defineProps<{
  open: boolean;
  editingId: string | null;
  saving: boolean;
  error: string;
  form: ProductForm;
  categories: Category[];
  areas: Area[];
  inlineArea: InlineAreaState;
  inlineCat: InlineCatState;
}>();

const emit = defineEmits<{
  close: [];
  submit: [];
  'clamp-price': [];
  'update:form': [patch: Partial<ProductForm>];
  'update:inlineAreaInput': [value: string];
  'update:inlineCatInput': [value: string];
  'update:inlineCatArea': [value: string];
}>();

const formName = computed({
  get: () => props.form.name,
  set: (v: string) => emit('update:form', { name: v }),
});
const formDescription = computed({
  get: () => props.form.description,
  set: (v: string) => emit('update:form', { description: v }),
});
const formPrice = computed({
  get: () => props.form.price,
  set: (v: number) => emit('update:form', { price: v }),
});
const formCategoryId = computed({
  get: () => props.form.categoryId,
  set: (v: string) => emit('update:form', { categoryId: v }),
});

const inlineAreaInputName = computed({
  get: () => props.inlineArea.inputName.value,
  set: (v: string) => emit('update:inlineAreaInput', v),
});

const inlineCatInputName = computed({
  get: () => props.inlineCat.inputName.value,
  set: (v: string) => emit('update:inlineCatInput', v),
});

const inlineCatAreaId = computed({
  get: () => props.inlineCat.inputAreaId.value,
  set: (v: string) => emit('update:inlineCatArea', v),
});

const showInline = computed(() => props.categories.length === 0 && !props.editingId);
const needsArea = computed(() => showInline.value && props.areas.length === 0);
const canCreateCat = computed(() => showInline.value && props.areas.length > 0);
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
        @focus="($event.target as HTMLInputElement).select()"
      />
    </AdminFormField>

    <AdminFormField :label="'Categoría'" :for="showInline ? 'inline-cat-input' : 'prod-cat'">
      <!-- No categories: cascaded inline creation -->
      <template v-if="showInline">
        <div class="no-cat-notice" role="alert">
          <span class="no-cat-title">{{ ADMIN_LABELS.product.noCategoriesNotice }}</span>
          <span class="no-cat-hint">
            {{
              needsArea
                ? 'Primero crea un área, luego una categoría.'
                : 'Crea una categoría para poder agregar productos.'
            }}
          </span>
        </div>

        <!-- Step 1: create area (only when no areas exist) -->
        <template v-if="needsArea">
          <p class="inline-step-label">1. Nueva área</p>
          <div class="inline-form">
            <input
              v-model="inlineAreaInputName"
              class="field-input inline-main-input"
              placeholder="Nombre del área..."
              :disabled="props.inlineArea.creating.value"
            />
            <button
              type="button"
              class="inline-btn"
              :disabled="
                props.inlineArea.creating.value || !props.inlineArea.inputName.value.trim()
              "
              @click="props.inlineArea.submit()"
            >
              {{ props.inlineArea.creating.value ? 'Creando...' : '+ Crear área' }}
            </button>
          </div>
          <p v-if="props.inlineArea.error.value" class="inline-error">
            {{ props.inlineArea.error.value }}
          </p>
        </template>

        <!-- Step 2: create category (once areas exist) -->
        <template v-if="canCreateCat">
          <p v-if="!needsArea" class="inline-step-label">Nueva categoría</p>
          <p v-else class="inline-step-label">2. Nueva categoría</p>
          <div class="inline-form">
            <input
              id="inline-cat-input"
              v-model="inlineCatInputName"
              class="field-input inline-main-input"
              :placeholder="ADMIN_LABELS.product.categoryNamePlaceholder"
              :disabled="props.inlineCat.creating.value"
            />
            <select
              v-model="inlineCatAreaId"
              class="field-input inline-area-select"
              :disabled="props.inlineCat.creating.value"
            >
              <option value="" disabled>Área</option>
              <option v-for="a in props.areas" :key="a.id" :value="a.id">{{ a.name }}</option>
            </select>
            <button
              type="button"
              class="inline-btn"
              :disabled="
                props.inlineCat.creating.value ||
                !props.inlineCat.inputName.value.trim() ||
                !props.inlineCat.inputAreaId.value
              "
              @click="props.inlineCat.submit()"
            >
              {{
                props.inlineCat.creating.value
                  ? 'Creando...'
                  : ADMIN_LABELS.product.createCategoryLabel
              }}
            </button>
          </div>
          <p v-if="props.inlineCat.error.value" class="inline-error">
            {{ props.inlineCat.error.value }}
          </p>
        </template>
      </template>

      <!-- Normal: category select -->
      <select v-else id="prod-cat" v-model="formCategoryId" class="field-input" required>
        <option value="" disabled>{{ ADMIN_LABELS.product.categoryPlaceholder }}</option>
        <option v-for="c in props.categories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
    </AdminFormField>
  </ModalDialog>
</template>

<style scoped>
.no-cat-notice {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 10px 14px;
  background: #fffbeb;
  border: 1.5px solid #fcd34d;
  border-radius: 10px;
  margin-bottom: 12px;
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

.inline-step-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin: 0 0 6px;
}

.inline-form {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
}

.inline-main-input {
  flex: 1;
  min-width: 0;
}

.inline-area-select {
  flex-shrink: 0;
  width: 110px;
}

.inline-btn {
  flex-shrink: 0;
  padding: 10px 14px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  transition: background 0.15s;
  cursor: pointer;
}

.inline-btn:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.inline-btn:disabled {
  background: #c8d8d6;
  cursor: not-allowed;
}

.inline-error {
  font-size: 0.8rem;
  color: #dc2626;
  margin-top: 2px;
  margin-bottom: 8px;
}
</style>

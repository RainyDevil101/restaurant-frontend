<script setup lang="ts">
import { computed } from 'vue';
import ModalDialog from './ModalDialog.vue';
import AdminFormField from './AdminFormField.vue';
import { colors } from '@/shared/styles/colors';
import type { MenuItem, Product } from '@/shared/types';
import { ROUTE_TITLES } from '@/shared/constants/brand';
import { ADMIN_LABELS, PRODUCT_PRICE_MAX } from '../constants';

interface MenuForm {
  name: string;
  price: number;
  items: MenuItem[];
}

const props = defineProps<{
  open: boolean;
  editingId: string | null;
  saving: boolean;
  error: string;
  form: MenuForm;
  products: Product[];
}>();

const emit = defineEmits<{
  close: [];
  submit: [];
  'clamp-price': [];
  'update:form': [patch: Partial<MenuForm>];
  'toggle-product': [productId: string];
  'set-quantity': [productId: string, quantity: number];
}>();

// Writable computed refs so v-model never mutates props directly
const formName = computed({
  get: () => props.form.name,
  set: (v: string) => emit('update:form', { name: v }),
});

const formPrice = computed({
  get: () => props.form.price,
  set: (v: number) => emit('update:form', { price: v }),
});

const productsLabel = computed(() =>
  props.form.items.length
    ? ADMIN_LABELS.menuForm.productsWithCount(props.form.items.length)
    : ROUTE_TITLES.PRODUCTOS,
);

function isSelected(productId: string) {
  return props.form.items.some((i) => i.productId === productId);
}

function getQuantity(productId: string): number {
  return props.form.items.find((i) => i.productId === productId)?.quantity ?? 1;
}
</script>

<template>
  <ModalDialog
    v-if="props.open"
    :title="props.editingId ? ADMIN_LABELS.menu.editTitle : ADMIN_LABELS.menu.newLabel"
    :saving="props.saving"
    :error="props.error"
    @close="emit('close')"
    @submit="emit('submit')"
  >
    <AdminFormField :label="ADMIN_LABELS.fields.name" for="menu-name">
      <input id="menu-name" v-model="formName" class="field-input" required />
    </AdminFormField>
    <AdminFormField :label="ADMIN_LABELS.fields.price" for="menu-price">
      <input
        id="menu-price"
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
    <AdminFormField :label="productsLabel" for="menu-products">
      <div id="menu-products" class="product-picker">
        <div
          v-for="p in props.products"
          :key="p.id"
          class="picker-row"
          :class="{ 'is-selected': isSelected(p.id) }"
          @click="emit('toggle-product', p.id)"
        >
          <input
            class="picker-check"
            type="checkbox"
            :checked="isSelected(p.id)"
            @click.stop="emit('toggle-product', p.id)"
          />
          <span class="picker-name">{{ p.name }}</span>
          <div v-if="isSelected(p.id)" class="qty-stepper" @click.stop>
            <button
              type="button"
              class="qty-btn"
              :disabled="getQuantity(p.id) <= 1"
              :aria-label="ADMIN_LABELS.menuForm.decreaseQty(p.name)"
              @click="emit('set-quantity', p.id, getQuantity(p.id) - 1)"
            >
              −
            </button>
            <span class="qty-val">{{ getQuantity(p.id) }}</span>
            <button
              type="button"
              class="qty-btn"
              :aria-label="ADMIN_LABELS.menuForm.increaseQty(p.name)"
              @click="emit('set-quantity', p.id, getQuantity(p.id) + 1)"
            >
              +
            </button>
          </div>
        </div>
        <p v-if="props.products.length === 0" class="picker-empty">
          {{ ADMIN_LABELS.menuForm.noProducts }}
        </p>
      </div>
    </AdminFormField>
  </ModalDialog>
</template>

<style scoped>
.product-picker {
  border: 1.5px solid v-bind('colors.neutral.border');
  border-radius: 10px;
  max-height: 240px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.picker-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-bottom: 1px solid v-bind('colors.neutral.borderSubtle');
  cursor: pointer;
  transition: background 0.1s;
  user-select: none;
}

.picker-row:last-child {
  border-bottom: none;
}

.picker-row:hover {
  background: v-bind('colors.neutral.surface');
}

.picker-row.is-selected {
  background: v-bind('colors.brand.soft');
}

.picker-check {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  accent-color: v-bind('colors.brand.primary');
  cursor: pointer;
}

.picker-name {
  flex: 1;
  min-width: 0;
  font-size: 0.9rem;
  color: v-bind('colors.neutral.textMedium');
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.is-selected .picker-name {
  color: v-bind('colors.neutral.textStrong');
  font-weight: 500;
}

.qty-stepper {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  border: 1.5px solid v-bind('colors.neutral.border');
  border-radius: 8px;
  overflow: hidden;
  background: v-bind('colors.neutral.background');
}

.qty-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  font-size: 1rem;
  line-height: 1;
  color: v-bind('colors.neutral.textMedium');
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.1s;
}

.qty-btn:hover:not(:disabled) {
  background: v-bind('colors.neutral.borderSubtle');
  color: v-bind('colors.neutral.textStrong');
}

.qty-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.qty-val {
  min-width: 28px;
  text-align: center;
  font-size: 0.85rem;
  font-weight: 600;
  color: v-bind('colors.neutral.textStrong');
  border-left: 1.5px solid v-bind('colors.neutral.border');
  border-right: 1.5px solid v-bind('colors.neutral.border');
  padding: 0 4px;
  line-height: 28px;
}

.picker-empty {
  padding: 1rem 12px;
  font-size: 0.85rem;
  color: v-bind('colors.neutral.mutedText');
}
</style>

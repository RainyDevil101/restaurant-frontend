<script setup lang="ts">
import { computed } from 'vue';
import type { Product, Category, Menu } from '@/shared/types';
import CategoryTabs from './CategoryTabs.vue';
import ProductRow from './ProductRow.vue';
import ComboRow from './ComboRow.vue';
import { colors } from '@/shared/styles/colors';
import { UI_LABELS } from '@/shared/constants/ui';
import { SERVICE_LABELS } from '../domain';

const props = defineProps<{
  products: Product[];
  categories: Category[];
  combos: Menu[];
  loading: boolean;
  error: string;
  getQuantity: (id: string) => number;
}>();

const emit = defineEmits<{
  'add-product': [product: Product];
  'remove-product': [product: Product];
  'add-combo': [menu: Menu];
  'remove-combo': [menu: Menu];
  retry: [];
}>();

const searchQuery = defineModel<string>('searchQuery', { required: true });
const selectedCategoryId = defineModel<string | null>('selectedCategoryId', { required: true });

const filteredProducts = computed(() =>
  props.products.filter((p) => {
    if (selectedCategoryId.value !== null && p.categoryId !== selectedCategoryId.value)
      return false;
    const q = searchQuery.value.trim().toLowerCase();
    if (q && !p.name.toLowerCase().includes(q) && !p.description?.toLowerCase().includes(q))
      return false;
    return true;
  }),
);
</script>

<template>
  <div class="search-wrap">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      width="18"
      height="18"
      class="search-icon"
      aria-hidden="true"
    >
      <path
        d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
      />
    </svg>
    <input
      v-model="searchQuery"
      class="search-input"
      type="text"
      inputmode="search"
      enterkeyhint="search"
      autocapitalize="off"
      autocorrect="off"
      autocomplete="off"
      spellcheck="false"
      :aria-label="SERVICE_LABELS.catalog.searchAria"
      :placeholder="SERVICE_LABELS.catalog.searchPlaceholder"
    />
    <button
      v-if="searchQuery"
      type="button"
      class="clear-btn"
      :aria-label="SERVICE_LABELS.catalog.clearSearchAria"
      @click="searchQuery = ''"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        width="18"
        height="18"
        aria-hidden="true"
      >
        <path
          d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
        />
      </svg>
    </button>
  </div>

  <CategoryTabs v-model="selectedCategoryId" :categories="categories" />

  <hr class="divider" />

  <div class="product-list">
    <p v-if="loading" class="empty-msg">{{ UI_LABELS.loading }}</p>
    <div v-else-if="error" class="error-state">
      <p class="error-msg">{{ error }}</p>
      <button type="button" class="retry-btn" @click="emit('retry')">{{ UI_LABELS.retry }}</button>
    </div>
    <template v-else>
      <ProductRow
        v-for="product in filteredProducts"
        :key="product.id"
        :product="product"
        :quantity="getQuantity(product.id)"
        @add="emit('add-product', product)"
        @remove="emit('remove-product', product)"
      />
      <p v-if="filteredProducts.length === 0" class="empty-msg">
        {{ SERVICE_LABELS.catalog.noResults }}
      </p>
    </template>
  </div>

  <template v-if="!loading && !error && combos.length > 0">
    <hr class="divider" />
    <div class="combos-header">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        width="18"
        height="18"
        aria-hidden="true"
      >
        <path
          d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"
        />
      </svg>
      <span>{{ SERVICE_LABELS.catalog.combos }}</span>
    </div>
    <div class="combo-list">
      <ComboRow
        v-for="menu in combos"
        :key="menu.id"
        :menu="menu"
        :products="products"
        :quantity="getQuantity(menu.id)"
        @add="emit('add-combo', menu)"
        @remove="emit('remove-combo', menu)"
      />
    </div>
  </template>
</template>

<style scoped>
.search-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f3f4f6;
  border-radius: 10px;
  padding: 10px 14px;
}

.search-icon {
  flex-shrink: 0;
  color: v-bind('colors.neutral.mutedText');
}

.search-input {
  flex: 1;
  min-width: 0;
  background: none;
  border: none;
  font-size: 0.9rem;
  color: #1a1a1a;
  font-family: inherit;
}

.search-input::placeholder {
  color: v-bind('colors.neutral.mutedText');
}

.clear-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border: none;
  background: none;
  color: v-bind('colors.neutral.mutedText');
  border-radius: 50%;
}

.clear-btn:active {
  background: #e5e7eb;
}

.divider {
  border: none;
  border-top: 1px solid #f0f0f0;
  margin: 0;
}

.product-list {
  display: flex;
  flex-direction: column;
}

.empty-msg {
  padding: 1.5rem 0;
  text-align: center;
  color: v-bind('colors.neutral.mutedText');
  font-size: 0.9rem;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 1.5rem 0;
}

.error-msg {
  text-align: center;
  color: v-bind('colors.feedback.error');
  font-size: 0.9rem;
}

.retry-btn {
  min-height: 2.75rem;
  padding: 0 1.5rem;
  border-radius: 10px;
  border: 1.5px solid var(--color-primary);
  background: white;
  color: var(--color-primary);
  font-size: 0.9rem;
  font-weight: 600;
}

.retry-btn:active {
  background: v-bind('colors.brand.soft');
}

.combos-header {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--color-primary);
  font-size: 0.95rem;
  font-weight: 700;
}

.combo-list {
  display: flex;
  flex-direction: column;
}
</style>

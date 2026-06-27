import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AdminSearchBar from '@/modules/admin/components/AdminSearchBar.vue';

function mountSearch(props: Record<string, unknown> = {}) {
  return mount(AdminSearchBar, {
    props: { modelValue: '', ...props },
  });
}

describe('AdminSearchBar', () => {
  it('renders the placeholder', () => {
    const wrapper = mountSearch({ placeholder: 'Buscar producto' });
    expect(wrapper.find('input').attributes('placeholder')).toBe('Buscar producto');
  });

  it('binds the input value from modelValue', () => {
    const wrapper = mountSearch({ modelValue: 'pizza' });
    expect((wrapper.find('input').element as HTMLInputElement).value).toBe('pizza');
  });

  it('emits update:modelValue with the typed value on input', async () => {
    const wrapper = mountSearch();
    await wrapper.find('input').setValue('tacos');
    expect(wrapper.emitted('update:modelValue')).toEqual([['tacos']]);
  });
});

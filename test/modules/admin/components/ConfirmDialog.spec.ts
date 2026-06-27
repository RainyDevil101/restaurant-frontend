import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ConfirmDialog from '@/modules/admin/components/ConfirmDialog.vue';

function mountConfirm(props: Record<string, unknown> = {}) {
  return mount(ConfirmDialog, {
    props: { title: '¿Eliminar producto?', message: 'Esta acción no se puede deshacer', ...props },
    global: { stubs: { teleport: true } },
  });
}

describe('ConfirmDialog', () => {
  it('renders the title and message', () => {
    const wrapper = mountConfirm();
    expect(wrapper.find('.title').text()).toBe('¿Eliminar producto?');
    expect(wrapper.find('.body').text()).toBe('Esta acción no se puede deshacer');
  });

  it('uses the Eliminar confirm label by default', () => {
    const wrapper = mountConfirm();
    expect(wrapper.find('.btn-confirm').text()).toBe('Eliminar');
  });

  it('emits confirm when the confirm button is clicked', async () => {
    const wrapper = mountConfirm();
    await wrapper.find('.btn-confirm').trigger('click');
    expect(wrapper.emitted('confirm')).toHaveLength(1);
  });

  it('emits close when the cancel button is clicked', async () => {
    const wrapper = mountConfirm();
    await wrapper.find('.btn-cancel').trigger('click');
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('emits close when the overlay is clicked', async () => {
    const wrapper = mountConfirm();
    await wrapper.find('.overlay').trigger('click');
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('shows the saving label and disables confirm when saving', () => {
    const wrapper = mountConfirm({ saving: true });
    const confirm = wrapper.find('.btn-confirm');
    expect(confirm.text()).toBe('Eliminando…');
    expect(confirm.attributes('disabled')).toBeDefined();
  });

  it('renders the error message and disables confirm when error is set', () => {
    const wrapper = mountConfirm({ error: 'No se pudo eliminar' });
    const err = wrapper.find('.error');
    expect(err.exists()).toBe(true);
    expect(err.text()).toBe('No se pudo eliminar');
    expect(wrapper.find('.btn-confirm').attributes('disabled')).toBeDefined();
  });

  it('does not render the error message by default', () => {
    const wrapper = mountConfirm();
    expect(wrapper.find('.error').exists()).toBe(false);
  });
});

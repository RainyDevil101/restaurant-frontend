import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ModalDialog from '@/modules/admin/components/ModalDialog.vue';

function mountModal(props: Record<string, unknown> = {}, slot = '') {
  return mount(ModalDialog, {
    props: { title: 'Editar producto', ...props },
    slots: slot ? { default: slot } : {},
    global: { stubs: { teleport: true } },
  });
}

describe('ModalDialog', () => {
  it('renders the title', () => {
    const wrapper = mountModal();
    expect(wrapper.find('.modal-title').text()).toBe('Editar producto');
  });

  it('renders default slot content', () => {
    const wrapper = mountModal({}, '<p class="slotted">hello</p>');
    expect(wrapper.find('.slotted').exists()).toBe(true);
    expect(wrapper.find('.modal-body').text()).toContain('hello');
  });

  it('emits submit when the form is submitted', async () => {
    const wrapper = mountModal();
    await wrapper.find('form').trigger('submit');
    expect(wrapper.emitted('submit')).toHaveLength(1);
  });

  it('emits close when the close button is clicked', async () => {
    const wrapper = mountModal();
    await wrapper.find('.close-x').trigger('click');
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('emits close when the cancel button is clicked', async () => {
    const wrapper = mountModal();
    await wrapper.find('.btn-cancel').trigger('click');
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('emits close when the overlay is clicked', async () => {
    const wrapper = mountModal();
    await wrapper.find('.modal-overlay').trigger('click');
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('does not render the error message by default', () => {
    const wrapper = mountModal();
    expect(wrapper.find('.modal-error').exists()).toBe(false);
  });

  it('renders the error message when error prop is set', () => {
    const wrapper = mountModal({ error: 'Algo salió mal' });
    const err = wrapper.find('.modal-error');
    expect(err.exists()).toBe(true);
    expect(err.text()).toBe('Algo salió mal');
  });

  it('shows the default save label and enables the button when not saving', () => {
    const wrapper = mountModal();
    const save = wrapper.find('.btn-save');
    expect(save.text()).toBe('Guardar');
    expect(save.attributes('disabled')).toBeUndefined();
  });

  it('disables the submit button and shows saving label when saving', () => {
    const wrapper = mountModal({ saving: true });
    const save = wrapper.find('.btn-save');
    expect(save.attributes('disabled')).toBeDefined();
    expect(save.text()).toBe('Guardando…');
  });
});

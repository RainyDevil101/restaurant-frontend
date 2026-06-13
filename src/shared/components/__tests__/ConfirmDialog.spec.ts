import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfirmDialog from '../ConfirmDialog.vue'

function mountDialog(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  return mount(ConfirmDialog, {
    props: { title: 'Eliminar producto', ...props },
    slots,
    global: { stubs: { teleport: true } },
  })
}

describe('ConfirmDialog', () => {
  it('renders the title prop', () => {
    const wrapper = mountDialog({ title: 'Eliminar mesa' })
    expect(wrapper.find('.title').text()).toBe('Eliminar mesa')
  })

  it('renders the message prop in the body', () => {
    const wrapper = mountDialog({ message: '¿Estás seguro?' })
    expect(wrapper.find('.body').text()).toBe('¿Estás seguro?')
  })

  it('prefers slot content over the message prop', () => {
    const wrapper = mountDialog({ message: 'mensaje prop' }, { default: 'mensaje slot' })
    expect(wrapper.find('.body').text()).toBe('mensaje slot')
  })

  it('uses the default confirm label "Eliminar"', () => {
    const wrapper = mountDialog()
    expect(wrapper.find('.btn-confirm').text()).toBe('Eliminar')
  })

  it('uses a custom confirmLabel when provided', () => {
    const wrapper = mountDialog({ confirmLabel: 'Confirmar' })
    expect(wrapper.find('.btn-confirm').text()).toBe('Confirmar')
  })

  it('emits "confirm" when the confirm button is clicked', async () => {
    const wrapper = mountDialog()
    await wrapper.find('.btn-confirm').trigger('click')
    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  it('emits "cancel" when the cancel button is clicked', async () => {
    const wrapper = mountDialog()
    await wrapper.find('.btn-cancel').trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('emits "cancel" when the overlay backdrop is clicked', async () => {
    const wrapper = mountDialog()
    await wrapper.find('.overlay').trigger('click')
    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  it('shows the saving label and disables the confirm button while saving', () => {
    const wrapper = mountDialog({ saving: true, savingLabel: 'Eliminando…' })
    const confirm = wrapper.find('.btn-confirm')
    expect(confirm.text()).toBe('Eliminando…')
    expect(confirm.attributes('disabled')).toBeDefined()
  })

  it('does not disable the confirm button when idle', () => {
    const wrapper = mountDialog()
    expect(wrapper.find('.btn-confirm').attributes('disabled')).toBeUndefined()
  })

  it('renders the error text and disables confirm when an error is present', () => {
    const wrapper = mountDialog({ error: 'Algo salió mal' })
    expect(wrapper.find('.error').text()).toBe('Algo salió mal')
    expect(wrapper.find('.btn-confirm').attributes('disabled')).toBeDefined()
  })

  it('does not render the error element when there is no error', () => {
    const wrapper = mountDialog()
    expect(wrapper.find('.error').exists()).toBe(false)
  })

  it('renders the dialog as an alertdialog with a modal flag', () => {
    const wrapper = mountDialog()
    const dialog = wrapper.find('.dialog')
    expect(dialog.attributes('role')).toBe('alertdialog')
    expect(dialog.attributes('aria-modal')).toBe('true')
  })
})

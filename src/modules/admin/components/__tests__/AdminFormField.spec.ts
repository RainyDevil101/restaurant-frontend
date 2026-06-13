import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminFormField from '../AdminFormField.vue'

function mountField(props: Record<string, unknown> = {}, slot = '') {
  return mount(AdminFormField, {
    props: { label: 'Nombre', for: 'name-input', ...props },
    slots: slot ? { default: slot } : {},
  })
}

describe('AdminFormField', () => {
  it('renders the label text', () => {
    const wrapper = mountField()
    expect(wrapper.find('.field-label').text()).toBe('Nombre')
  })

  it('associates the label with the control via for', () => {
    const wrapper = mountField({ for: 'price-input' })
    expect(wrapper.find('label').attributes('for')).toBe('price-input')
  })

  it('renders the default slot content', () => {
    const wrapper = mountField({}, '<input id="name-input" class="field-input" />')
    const input = wrapper.find('input')
    expect(input.exists()).toBe(true)
    expect(input.attributes('id')).toBe('name-input')
  })
})

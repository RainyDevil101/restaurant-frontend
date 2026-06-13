import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminPageHeader from '../AdminPageHeader.vue'

function mountHeader(props: Record<string, unknown> = {}) {
  return mount(AdminPageHeader, {
    props: { title: 'Productos', newLabel: 'Nuevo producto', ...props },
  })
}

describe('AdminPageHeader', () => {
  it('renders the title', () => {
    const wrapper = mountHeader()
    expect(wrapper.find('.page-title').text()).toBe('Productos')
  })

  it('renders the new button label', () => {
    const wrapper = mountHeader()
    expect(wrapper.find('.new-btn').text()).toContain('Nuevo producto')
  })

  it('emits create when the new button is clicked', async () => {
    const wrapper = mountHeader()
    await wrapper.find('.new-btn').trigger('click')
    expect(wrapper.emitted('create')).toHaveLength(1)
  })
})

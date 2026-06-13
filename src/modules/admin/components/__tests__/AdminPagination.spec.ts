import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AdminPagination from '../AdminPagination.vue'

function mountPagination(props: Record<string, unknown> = {}) {
  return mount(AdminPagination, {
    props: {
      page: 2,
      pageSize: 10,
      totalPages: 5,
      pageSizeOptions: [10, 25, 50] as const,
      ...props,
    },
  })
}

describe('AdminPagination', () => {
  it('renders the current page and total pages', () => {
    const wrapper = mountPagination()
    expect(wrapper.find('.page-status').text()).toBe('Página 2 de 5')
  })

  it('renders an option per page size and reflects the selected value', () => {
    const wrapper = mountPagination()
    const options = wrapper.findAll('option')
    expect(options).toHaveLength(3)
    expect(options.map((o) => o.text())).toEqual(['10', '25', '50'])
    expect((wrapper.find('select').element as HTMLSelectElement).value).toBe('10')
  })

  it('emits update:page with the previous page when prev is clicked', async () => {
    const wrapper = mountPagination()
    await wrapper.find('[aria-label="Página anterior"]').trigger('click')
    expect(wrapper.emitted('update:page')).toEqual([[1]])
  })

  it('emits update:page with the next page when next is clicked', async () => {
    const wrapper = mountPagination()
    await wrapper.find('[aria-label="Página siguiente"]').trigger('click')
    expect(wrapper.emitted('update:page')).toEqual([[3]])
  })

  it('emits update:pageSize as a number when the select changes', async () => {
    const wrapper = mountPagination()
    const select = wrapper.find('select')
    await select.setValue('25')
    expect(wrapper.emitted('update:pageSize')).toEqual([[25]])
  })

  it('disables the prev button on the first page', () => {
    const wrapper = mountPagination({ page: 1 })
    expect(wrapper.find('[aria-label="Página anterior"]').attributes('disabled')).toBeDefined()
    expect(wrapper.find('[aria-label="Página siguiente"]').attributes('disabled')).toBeUndefined()
  })

  it('disables the next button on the last page', () => {
    const wrapper = mountPagination({ page: 5 })
    expect(wrapper.find('[aria-label="Página siguiente"]').attributes('disabled')).toBeDefined()
    expect(wrapper.find('[aria-label="Página anterior"]').attributes('disabled')).toBeUndefined()
  })
})

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import BrandLogo from '../BrandLogo.vue'
import { BRAND, BRAND_TAGLINE } from '@/shared/constants/brand'

describe('BrandLogo', () => {
  it('renders the brand name', () => {
    const wrapper = mount(BrandLogo)
    expect(wrapper.find('.brand-logo__name').text()).toBe(BRAND)
  })

  it('hides the tagline by default', () => {
    const wrapper = mount(BrandLogo)
    expect(wrapper.find('.brand-logo__tagline').exists()).toBe(false)
  })

  it('renders the tagline when the tagline prop is set', () => {
    const wrapper = mount(BrandLogo, { props: { tagline: true } })
    expect(wrapper.find('.brand-logo__tagline').text()).toBe(BRAND_TAGLINE)
  })

  it('uses the brand variant class by default', () => {
    const wrapper = mount(BrandLogo)
    expect(wrapper.classes()).toContain('brand-logo--brand')
  })

  it('uses the onColor variant class when requested', () => {
    const wrapper = mount(BrandLogo, { props: { variant: 'onColor' } })
    expect(wrapper.classes()).toContain('brand-logo--onColor')
  })
})

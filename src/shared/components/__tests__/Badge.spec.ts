import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Badge from '../Badge.vue';
import type { BadgeTone } from '../Badge.vue';

describe('Badge', () => {
  it('renders the slot content', () => {
    const wrapper = mount(Badge, { slots: { default: 'Activo' } });
    expect(wrapper.text()).toBe('Activo');
  });

  it('always applies the base badge class', () => {
    const wrapper = mount(Badge, { slots: { default: 'x' } });
    expect(wrapper.find('span').classes()).toContain('badge');
  });

  it('defaults to the gray tone when no tone prop is passed', () => {
    const wrapper = mount(Badge, { slots: { default: 'x' } });
    expect(wrapper.find('span').classes()).toContain('badge--gray');
  });

  const tones: BadgeTone[] = ['gray', 'blue', 'green', 'amber', 'red', 'purple', 'teal'];

  it.each(tones)('applies the badge--%s class for tone "%s"', (tone) => {
    const wrapper = mount(Badge, { props: { tone }, slots: { default: 'x' } });
    expect(wrapper.find('span').classes()).toContain(`badge--${tone}`);
  });

  it('applies only the matching tone class, not the others', () => {
    const wrapper = mount(Badge, { props: { tone: 'blue' }, slots: { default: 'x' } });
    const classes = wrapper.find('span').classes();
    expect(classes).toContain('badge--blue');
    expect(classes).not.toContain('badge--gray');
    expect(classes).not.toContain('badge--green');
  });

  it('renders markup passed into the slot', () => {
    const wrapper = mount(Badge, { slots: { default: '<strong>Hola</strong>' } });
    expect(wrapper.find('strong').exists()).toBe(true);
    expect(wrapper.text()).toBe('Hola');
  });
});

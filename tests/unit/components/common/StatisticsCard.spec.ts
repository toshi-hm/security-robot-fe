import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import StatisticsCard from '~/components/common/StatisticsCard.vue'

describe('StatisticsCard', () => {
  const createWrapper = (props: any, slots?: any) => {
    return mount(StatisticsCard, {
      props,
      slots,
      global: {
        stubs: {
          ElCard: {
            template: `
              <div class="el-card">
                <div class="el-card__header"><slot name="header" /></div>
                <div class="el-card__body"><slot /></div>
              </div>
            `,
          },
          ElIcon: {
            template: '<div class="el-icon"><slot /></div>',
          },
          ElTag: {
            template: '<span class="el-tag"><slot /></span>',
          },
        },
      },
    })
  }

  it('renders with all props', () => {
    const wrapper = createWrapper({
      title: 'Training Sessions',
      value: 10,
      label: 'Total Sessions',
      colorTheme: 'primary',
    })

    expect(wrapper.text()).toContain('Training Sessions')
    expect(wrapper.text()).toContain('10')
    expect(wrapper.text()).toContain('Total Sessions')
  })

  it('applies correct color theme class', () => {
    const wrapper = createWrapper({
      title: 'Test',
      value: 5,
      label: 'Label',
      colorTheme: 'secondary',
    })

    expect(wrapper.find('.statistics-card').classes()).toContain('statistics-card--secondary')
  })

  it('renders icon when provided', () => {
    const wrapper = createWrapper({
      title: 'Test',
      value: 5,
      label: 'Label',
      colorTheme: 'primary',
      icon: 'TrendCharts',
    })

    expect(wrapper.find('.statistics-card__icon').exists()).toBe(true)
  })

  it('renders tag when tagText is provided', () => {
    const wrapper = createWrapper({
      title: 'Test',
      value: 5,
      label: 'Label',
      colorTheme: 'primary',
      tagText: 'Active: 2',
    })

    expect(wrapper.text()).toContain('Active: 2')
  })

  it('has correct BEM class structure', () => {
    const wrapper = createWrapper({
      title: 'Test',
      value: 5,
      label: 'Label',
      colorTheme: 'primary',
    })

    expect(wrapper.find('.statistics-card').exists()).toBe(true)
    expect(wrapper.find('.statistics-card__header').exists()).toBe(true)
    expect(wrapper.find('.statistics-card__content').exists()).toBe(true)
    expect(wrapper.find('.statistics-card__value').exists()).toBe(true)
    expect(wrapper.find('.statistics-card__label').exists()).toBe(true)
  })
})

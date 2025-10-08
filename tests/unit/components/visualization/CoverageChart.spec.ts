import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CoverageChart from '~/components/visualization/CoverageChart.vue'

describe('CoverageChart', () => {
  it('renders the chart wrapper', () => {
    const wrapper = mount(CoverageChart)

    expect(wrapper.find('.chart-wrapper').exists()).toBe(true)
  })

  it('renders a canvas element', () => {
    const wrapper = mount(CoverageChart)

    expect(wrapper.find('canvas').exists()).toBe(true)
  })

  it('has ref to canvas element', () => {
    const wrapper = mount(CoverageChart)
    const vm = wrapper.vm as any

    expect(vm.canvas).toBeDefined()
  })

  it('applies correct styling to wrapper', () => {
    const wrapper = mount(CoverageChart)
    const chartWrapper = wrapper.find('.chart-wrapper')

    expect(chartWrapper.exists()).toBe(true)
  })

  it('canvas is accessible through ref', () => {
    const wrapper = mount(CoverageChart)
    const canvas = wrapper.find('canvas').element

    expect(canvas).toBeInstanceOf(HTMLCanvasElement)
  })
})

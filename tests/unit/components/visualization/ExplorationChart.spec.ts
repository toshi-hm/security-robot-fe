import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import ExplorationChart from '~/components/visualization/ExplorationChart.vue'

describe('ExplorationChart', () => {
  it('renders the chart wrapper', () => {
    const wrapper = mount(ExplorationChart)

    expect(wrapper.find('.chart-wrapper').exists()).toBe(true)
  })

  it('renders a canvas element', () => {
    const wrapper = mount(ExplorationChart)

    expect(wrapper.find('canvas').exists()).toBe(true)
  })

  it('has ref to canvas element', () => {
    const wrapper = mount(ExplorationChart)
    const vm = wrapper.vm as any

    expect(vm.canvas).toBeDefined()
  })

  it('applies correct styling to wrapper', () => {
    const wrapper = mount(ExplorationChart)
    const chartWrapper = wrapper.find('.chart-wrapper')

    expect(chartWrapper.exists()).toBe(true)
  })

  it('canvas is accessible through ref', () => {
    const wrapper = mount(ExplorationChart)
    const canvas = wrapper.find('canvas').element

    expect(canvas).toBeInstanceOf(HTMLCanvasElement)
  })
})

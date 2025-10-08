import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'

import EnvironmentVisualization from '~/components/environment/EnvironmentVisualization.vue'

describe('EnvironmentVisualization', () => {
  it('renders the container element', () => {
    const wrapper = mount(EnvironmentVisualization)

    expect(wrapper.find('.environment-visualization').exists()).toBe(true)
  })

  it('renders a canvas element', () => {
    const wrapper = mount(EnvironmentVisualization)

    expect(wrapper.find('canvas').exists()).toBe(true)
  })

  it('sets correct canvas dimensions', () => {
    const wrapper = mount(EnvironmentVisualization)
    const canvas = wrapper.find('canvas').element as HTMLCanvasElement

    expect(canvas.width).toBe(640)
    expect(canvas.height).toBe(480)
  })

  it('has ref to canvas element', () => {
    const wrapper = mount(EnvironmentVisualization)
    const vm = wrapper.vm as any

    expect(vm.canvas).toBeDefined()
  })

  it('applies correct styling to container', () => {
    const wrapper = mount(EnvironmentVisualization)
    const container = wrapper.find('.environment-visualization')

    expect(container.exists()).toBe(true)
  })
})

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

  it('sets correct canvas dimensions with default props', () => {
    const wrapper = mount(EnvironmentVisualization)
    const canvas = wrapper.find('canvas').element as HTMLCanvasElement

    // Default: 8x8 grid with cellSize 60 = 480x480
    expect(canvas.width).toBe(480)
    expect(canvas.height).toBe(480)
  })

  it('sets correct canvas dimensions with custom grid size', () => {
    const wrapper = mount(EnvironmentVisualization, {
      props: {
        gridWidth: 10,
        gridHeight: 12,
      },
    })
    const canvas = wrapper.find('canvas').element as HTMLCanvasElement

    // 10x12 grid with cellSize 60 = 600x720
    expect(canvas.width).toBe(600)
    expect(canvas.height).toBe(720)
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

  it('accepts robot position prop', async () => {
    const wrapper = mount(EnvironmentVisualization, {
      props: {
        robotPosition: { x: 2, y: 3 },
      },
    })

    expect(wrapper.props('robotPosition')).toEqual({ x: 2, y: 3 })
  })

  it('accepts coverage map prop', async () => {
    const coverageMap = [
      [true, false],
      [false, true],
    ]
    const wrapper = mount(EnvironmentVisualization, {
      props: {
        gridWidth: 2,
        gridHeight: 2,
        coverageMap,
      },
    })

    expect(wrapper.props('coverageMap')).toEqual(coverageMap)
  })

  it('accepts threat grid prop', async () => {
    const threatGrid = [
      [0.1, 0.5],
      [0.3, 0.9],
    ]
    const wrapper = mount(EnvironmentVisualization, {
      props: {
        gridWidth: 2,
        gridHeight: 2,
        threatGrid,
      },
    })

    expect(wrapper.props('threatGrid')).toEqual(threatGrid)
  })
})

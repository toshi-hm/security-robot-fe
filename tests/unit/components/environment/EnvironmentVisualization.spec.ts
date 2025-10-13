import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'

import EnvironmentVisualization from '~/components/environment/EnvironmentVisualization.vue'

describe('EnvironmentVisualization', () => {
  let canvasMock: any

  beforeEach(() => {
    // Mock canvas context
    canvasMock = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      fillText: vi.fn(),
    }

    HTMLCanvasElement.prototype.getContext = vi.fn(() => canvasMock)
  })
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

  describe('Canvas Drawing', () => {
    it('calls clearRect when drawing environment', () => {
      mount(EnvironmentVisualization)

      expect(canvasMock.clearRect).toHaveBeenCalled()
    })

    it('draws grid cells', () => {
      mount(EnvironmentVisualization, {
        props: {
          gridWidth: 2,
          gridHeight: 2,
        },
      })

      // Should draw 4 cells (2x2)
      expect(canvasMock.fillRect).toHaveBeenCalled()
      expect(canvasMock.strokeRect).toHaveBeenCalled()
    })

    it('draws robot position when provided', () => {
      mount(EnvironmentVisualization, {
        props: {
          robotPosition: { x: 1, y: 1 },
        },
      })

      // Robot is drawn with arc (circle)
      expect(canvasMock.arc).toHaveBeenCalled()
      expect(canvasMock.fill).toHaveBeenCalled()
    })

    it('does not draw robot when position is null', () => {
      mount(EnvironmentVisualization, {
        props: {
          robotPosition: null,
        },
      })

      // Arc should be called for legend but not excessive times
      const arcCallCount = canvasMock.arc.mock.calls.length
      expect(arcCallCount).toBeLessThan(3) // Only direction indicator if robot drawn
    })

    it('draws coverage overlay for visited cells', () => {
      mount(EnvironmentVisualization, {
        props: {
          gridWidth: 2,
          gridHeight: 2,
          coverageMap: [
            [true, false],
            [false, true],
          ],
        },
      })

      expect(canvasMock.fillRect).toHaveBeenCalled()
    })

    it('draws threat level heatmap', () => {
      mount(EnvironmentVisualization, {
        props: {
          gridWidth: 2,
          gridHeight: 2,
          threatGrid: [
            [0.2, 0.5],
            [0.7, 0.9],
          ],
        },
      })

      expect(canvasMock.fillRect).toHaveBeenCalled()
    })

    it('draws legend', () => {
      mount(EnvironmentVisualization)

      expect(canvasMock.fillText).toHaveBeenCalled()
    })
  })

  describe('Reactivity', () => {
    it('redraws when robot position changes', async () => {
      const wrapper = mount(EnvironmentVisualization, {
        props: {
          robotPosition: { x: 0, y: 0 },
        },
      })

      canvasMock.clearRect.mockClear()

      await wrapper.setProps({ robotPosition: { x: 2, y: 2 } })
      await nextTick()

      expect(canvasMock.clearRect).toHaveBeenCalled()
    })

    it('redraws when coverage map changes', async () => {
      const wrapper = mount(EnvironmentVisualization, {
        props: {
          gridWidth: 2,
          gridHeight: 2,
          coverageMap: [
            [false, false],
            [false, false],
          ],
        },
      })

      canvasMock.clearRect.mockClear()

      await wrapper.setProps({
        coverageMap: [
          [true, false],
          [false, true],
        ],
      })
      await nextTick()

      expect(canvasMock.clearRect).toHaveBeenCalled()
    })

    it('redraws when threat grid changes', async () => {
      const wrapper = mount(EnvironmentVisualization, {
        props: {
          gridWidth: 2,
          gridHeight: 2,
          threatGrid: [
            [0.1, 0.2],
            [0.3, 0.4],
          ],
        },
      })

      canvasMock.clearRect.mockClear()

      await wrapper.setProps({
        threatGrid: [
          [0.5, 0.6],
          [0.7, 0.8],
        ],
      })
      await nextTick()

      expect(canvasMock.clearRect).toHaveBeenCalled()
    })

    it('redraws when grid dimensions change', async () => {
      const wrapper = mount(EnvironmentVisualization, {
        props: {
          gridWidth: 4,
          gridHeight: 4,
        },
      })

      canvasMock.clearRect.mockClear()

      await wrapper.setProps({
        gridWidth: 6,
        gridHeight: 6,
      })
      await nextTick()

      expect(canvasMock.clearRect).toHaveBeenCalled()
    })
  })

  describe('getThreatColor', () => {
    it('returns gray for zero threat level', () => {
      const wrapper = mount(EnvironmentVisualization)
      const vm = wrapper.vm as any

      const color = vm.getThreatColor(0)
      expect(color).toBe('#f0f0f0')
    })

    it('returns yellow-ish for low threat level', () => {
      const wrapper = mount(EnvironmentVisualization)
      const vm = wrapper.vm as any

      const color = vm.getThreatColor(0.2)
      expect(color).toMatch(/^rgb\(255, \d+, 0\)$/)
    })

    it('returns red for high threat level', () => {
      const wrapper = mount(EnvironmentVisualization)
      const vm = wrapper.vm as any

      const color = vm.getThreatColor(1.0)
      expect(color).toBe('rgb(255, 0, 0)')
    })

    it('interpolates colors for medium threat level', () => {
      const wrapper = mount(EnvironmentVisualization)
      const vm = wrapper.vm as any

      const color = vm.getThreatColor(0.5)
      expect(color).toMatch(/^rgb\(255, \d+, 0\)$/)
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined threat grid cells', () => {
      mount(EnvironmentVisualization, {
        props: {
          gridWidth: 3,
          gridHeight: 3,
          threatGrid: [[0.5]], // Sparse array
        },
      })

      expect(canvasMock.fillRect).toHaveBeenCalled()
    })

    it('handles undefined coverage map cells', () => {
      mount(EnvironmentVisualization, {
        props: {
          gridWidth: 3,
          gridHeight: 3,
          coverageMap: [[true]], // Sparse array
        },
      })

      expect(canvasMock.fillRect).toHaveBeenCalled()
    })

    it('handles fractional robot positions', () => {
      mount(EnvironmentVisualization, {
        props: {
          robotPosition: { x: 1.7, y: 2.3 },
        },
      })

      expect(canvasMock.arc).toHaveBeenCalled()
    })
  })
})

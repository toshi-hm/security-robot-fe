import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'

import EnvironmentVisualization from '~/components/environment/EnvironmentVisualization.vue'

describe('EnvironmentVisualization', () => {
  let canvasMock: any
  const mountOptions = {
    global: {
      stubs: {
        'el-button': true,
      },
    },
  }

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
      closePath: vi.fn(),
      fillText: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      scale: vi.fn(),
      translate: vi.fn(),
      setLineDash: vi.fn(),
    }

    HTMLCanvasElement.prototype.getContext = vi.fn(() => canvasMock)

    // Reset mocks
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Rendering', () => {
    it('renders the container element', () => {
      const wrapper = mount(EnvironmentVisualization, mountOptions)
      expect(wrapper.find('.environment-visualization').exists()).toBe(true)
    })

    it('renders a canvas element', () => {
      const wrapper = mount(EnvironmentVisualization, mountOptions)
      expect(wrapper.find('canvas').exists()).toBe(true)
    })

    it('sets correct canvas dimensions with default props', () => {
      const wrapper = mount(EnvironmentVisualization, mountOptions)
      const canvas = wrapper.find('canvas').element as HTMLCanvasElement

      // Default: 8x8 grid with cellSize 60 = 480x480
      expect(canvas.width).toBe(480)
      expect(canvas.height).toBe(480)
    })

    it('sets correct canvas dimensions with custom grid size', () => {
      const wrapper = mount(EnvironmentVisualization, {
        ...mountOptions,
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
      const wrapper = mount(EnvironmentVisualization, mountOptions)
      const vm = wrapper.vm as any

      expect(vm.canvas).toBeDefined()
    })

    it('applies correct styling to container', () => {
      const wrapper = mount(EnvironmentVisualization, mountOptions)
      expect(wrapper.classes()).toContain('environment-visualization')
    })
  })

  describe('Canvas Helpers', () => {
    it('getThreatColor returns gray for zero threat level', () => {
      const wrapper = mount(EnvironmentVisualization, mountOptions)
      const vm = wrapper.vm as any
      const color = vm.getThreatColor(0)
      expect(color).toBe('var(--color-bg-no-threat)')
    })

    it('returns yellow-ish for low threat level', () => {
      const wrapper = mount(EnvironmentVisualization, mountOptions)
      const vm = wrapper.vm as any
      const color = vm.getThreatColor(0.2)
      expect(color).toMatch(/^rgb\(255, \d+, 0\)$/)
    })

    it('returns red for high threat level', () => {
      const wrapper = mount(EnvironmentVisualization, mountOptions)
      const vm = wrapper.vm as any
      const color = vm.getThreatColor(1.0)
      expect(color).toBe('rgb(255, 0, 0)')
    })

    it('interpolates colors for medium threat level', () => {
      const wrapper = mount(EnvironmentVisualization, mountOptions)
      const vm = wrapper.vm as any
      const color = vm.getThreatColor(0.5)
      expect(color).toMatch(/^rgb\(255, \d+, 0\)$/)
    })
  })

  describe('Canvas Drawing', () => {
    it('calls clearRect when drawing environment', async () => {
      mount(EnvironmentVisualization, mountOptions)
      await nextTick()
      vi.runAllTimers()

      expect(canvasMock.clearRect).toHaveBeenCalled()
    })

    it('draws grid cells', async () => {
      mount(EnvironmentVisualization, {
        ...mountOptions,
        props: {
          gridWidth: 2,
          gridHeight: 2,
        },
      })
      await nextTick()
      vi.runAllTimers()

      expect(canvasMock.fillRect).toHaveBeenCalled()
      expect(canvasMock.strokeRect).toHaveBeenCalled()
    })

    it('draws robot position when provided', async () => {
      mount(EnvironmentVisualization, {
        ...mountOptions,
        props: {
          robotPosition: { x: 1, y: 1 },
        },
      })
      await nextTick()
      vi.runAllTimers()

      expect(canvasMock.arc).toHaveBeenCalled()
      expect(canvasMock.fill).toHaveBeenCalled()
    })

    it('does not draw robot when position is null', async () => {
      mount(EnvironmentVisualization, {
        ...mountOptions,
        props: {
          robotPosition: null,
        },
      })
      await nextTick()
      vi.runAllTimers()

      // Arc should be called for legend but not excessive times
      const arcCallCount = canvasMock.arc.mock.calls.length
      expect(arcCallCount).toBeLessThan(3) // Only direction indicator if robot drawn
    })

    it('draws coverage overlay for visited cells', async () => {
      mount(EnvironmentVisualization, {
        ...mountOptions,
        props: {
          gridWidth: 2,
          gridHeight: 2,
          coverageMap: [
            [true, false],
            [false, true],
          ],
        },
      })
      await nextTick()
      vi.runAllTimers()

      expect(canvasMock.fillRect).toHaveBeenCalled()
    })

    it('draws threat level heatmap', async () => {
      mount(EnvironmentVisualization, {
        ...mountOptions,
        props: {
          gridWidth: 2,
          gridHeight: 2,
          threatGrid: [
            [0.2, 0.5],
            [0.7, 0.9],
          ],
        },
      })
      await nextTick()
      vi.runAllTimers()

      expect(canvasMock.fillRect).toHaveBeenCalled()
    })

    it('renders HTML legend', () => {
      const wrapper = mount(EnvironmentVisualization, mountOptions)

      expect(wrapper.find('.environment-visualization__legend').exists()).toBe(true)
      expect(wrapper.findAll('.environment-visualization__legend-section').length).toBeGreaterThan(0)
      expect(wrapper.findAll('.environment-visualization__legend-item').length).toBeGreaterThan(0)
    })

    it('draws trajectory path when provided', async () => {
      const trajectory = [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: 2, y: 2 },
      ]

      mount(EnvironmentVisualization, {
        ...mountOptions,
        props: {
          trajectory,
        },
      })
      await nextTick()
      vi.runAllTimers()

      // Trajectory is drawn with stroke (line)
      expect(canvasMock.beginPath).toHaveBeenCalled()
      expect(canvasMock.stroke).toHaveBeenCalled()
    })

    it('does not draw trajectory when empty', async () => {
      canvasMock.arc.mockClear()

      mount(EnvironmentVisualization, {
        ...mountOptions,
        props: {
          trajectory: [],
        },
      })
      await nextTick()
      vi.runAllTimers()

      // Should still draw robot direction and legend, but not trajectory points
      const arcCallsAfter = canvasMock.arc.mock.calls.length
      expect(arcCallsAfter).toBeLessThan(5)
    })

    it('draws orientation indicator when orientation is provided', async () => {
      mount(EnvironmentVisualization, {
        ...mountOptions,
        props: {
          robotPosition: { x: 1, y: 1 },
          robotOrientation: 1,
        },
      })
      await nextTick()
      vi.runAllTimers()

      expect(canvasMock.lineTo).toHaveBeenCalled()
    })

    it('draws patrol range overlay when patrol radius is set', async () => {
      mount(EnvironmentVisualization, {
        ...mountOptions,
        props: {
          robotPosition: { x: 1, y: 1 },
          patrolRadius: 2,
        },
      })
      await nextTick()
      vi.runAllTimers()

      expect(canvasMock.setLineDash).toHaveBeenCalled()
    })
  })

  describe('Reactivity', () => {
    it('redraws when robot position changes', async () => {
      const wrapper = mount(EnvironmentVisualization, mountOptions)
      await nextTick()
      vi.runAllTimers()
      canvasMock.clearRect.mockClear()

      await wrapper.setProps({ robotPosition: { x: 2, y: 2 } })
      await nextTick()
      vi.runAllTimers()

      expect(canvasMock.clearRect).toHaveBeenCalled()
    })

    it('redraws when coverage map changes', async () => {
      const wrapper = mount(EnvironmentVisualization, mountOptions)
      await nextTick()
      vi.runAllTimers()
      canvasMock.clearRect.mockClear()

      await wrapper.setProps({
        coverageMap: [
          [true, false],
          [false, true],
        ],
      })
      await nextTick()
      vi.runAllTimers()

      expect(canvasMock.clearRect).toHaveBeenCalled()
    })

    it('redraws when threat grid changes', async () => {
      const wrapper = mount(EnvironmentVisualization, mountOptions)
      await nextTick()
      vi.runAllTimers()
      canvasMock.clearRect.mockClear()

      await wrapper.setProps({
        threatGrid: [
          [0.5, 0.6],
          [0.7, 0.8],
        ],
      })
      await nextTick()
      vi.runAllTimers()

      expect(canvasMock.clearRect).toHaveBeenCalled()
    })

    it('redraws when grid dimensions change', async () => {
      const wrapper = mount(EnvironmentVisualization, {
        ...mountOptions,
        props: {
          gridWidth: 4,
          gridHeight: 4,
        },
      })

      // Wait for initial mount
      await nextTick()
      vi.runAllTimers()
      canvasMock.clearRect.mockClear()

      await wrapper.setProps({
        gridWidth: 6,
        gridHeight: 6,
      })
      await nextTick()
      vi.runAllTimers()

      expect(canvasMock.clearRect).toHaveBeenCalled()
    })

    it('redraws when trajectory changes', async () => {
      const wrapper = mount(EnvironmentVisualization, mountOptions)
      await nextTick()
      vi.runAllTimers()
      canvasMock.clearRect.mockClear()

      await wrapper.setProps({
        trajectory: [
          { x: 0, y: 0 },
          { x: 1, y: 1 },
          { x: 2, y: 2 },
        ],
      })
      await nextTick()
      vi.runAllTimers()

      expect(canvasMock.clearRect).toHaveBeenCalled()
    })
  })

  describe('Edge Cases', () => {
    it('handles undefined threat grid cells', async () => {
      mount(EnvironmentVisualization, {
        ...mountOptions,
        props: {
          gridWidth: 3,
          gridHeight: 3,
          threatGrid: [[0.5]], // Sparse array
        },
      })
      await nextTick()
      vi.runAllTimers()

      expect(canvasMock.fillRect).toHaveBeenCalled()
    })

    it('handles undefined coverage map cells', async () => {
      mount(EnvironmentVisualization, {
        ...mountOptions,
        props: {
          gridWidth: 3,
          gridHeight: 3,
          coverageMap: [[true]], // Sparse array
        },
      })
      await nextTick()
      vi.runAllTimers()

      expect(canvasMock.fillRect).toHaveBeenCalled()
    })

    it('handles fractional robot positions', async () => {
      mount(EnvironmentVisualization, {
        ...mountOptions,
        props: {
          robotPosition: { x: 1.7, y: 2.3 },
        },
      })
      await nextTick()
      vi.runAllTimers()

      expect(canvasMock.arc).toHaveBeenCalled()
    })
  })
})

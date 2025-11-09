import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
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
  })
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
    const container = wrapper.find('.environment-visualization')

    expect(container.exists()).toBe(true)
  })

  it('accepts robot position prop', async () => {
    const wrapper = mount(EnvironmentVisualization, {
      ...mountOptions,
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
      ...mountOptions,
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
      ...mountOptions,
      props: {
        gridWidth: 2,
        gridHeight: 2,
        threatGrid,
      },
    })

    expect(wrapper.props('threatGrid')).toEqual(threatGrid)
  })

  it('accepts robot orientation prop', () => {
    const wrapper = mount(EnvironmentVisualization, {
      ...mountOptions,
      props: {
        robotOrientation: 1,
      },
    })

    expect(wrapper.props('robotOrientation')).toBe(1)
  })

  it('accepts trajectory prop', async () => {
    const trajectory = [
      { x: 0, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 2 },
    ]
    const wrapper = mount(EnvironmentVisualization, {
      ...mountOptions,
      props: {
        trajectory,
      },
    })

    expect(wrapper.props('trajectory')).toEqual(trajectory)
  })

  describe('Canvas Drawing', () => {
    it('calls clearRect when drawing environment', () => {
      mount(EnvironmentVisualization, mountOptions)

      expect(canvasMock.clearRect).toHaveBeenCalled()
    })

    it('draws grid cells', () => {
      mount(EnvironmentVisualization, {
        ...mountOptions,
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
        ...mountOptions,
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
        ...mountOptions,
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

      expect(canvasMock.fillRect).toHaveBeenCalled()
    })

    it('draws threat level heatmap', () => {
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

      expect(canvasMock.fillRect).toHaveBeenCalled()
    })

    it('renders HTML legend', () => {
      const wrapper = mount(EnvironmentVisualization, mountOptions)

      // Check that legend container exists
      const legend = wrapper.find('.environment-visualization__legend')
      expect(legend.exists()).toBe(true)

      // Check that legend sections exist
      const sections = wrapper.findAll('.environment-visualization__legend-section')
      expect(sections.length).toBeGreaterThan(0)

      // Check that legend items exist
      const items = wrapper.findAll('.environment-visualization__legend-item')
      expect(items.length).toBeGreaterThan(0)
    })

    it('draws trajectory path when provided', () => {
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

      // Trajectory is drawn with stroke (line)
      expect(canvasMock.beginPath).toHaveBeenCalled()
      expect(canvasMock.stroke).toHaveBeenCalled()
      // Trajectory points are drawn with arc (circles)
      expect(canvasMock.arc).toHaveBeenCalled()
    })

    it('does not draw trajectory when empty', () => {
      canvasMock.arc.mockClear()

      mount(EnvironmentVisualization, {
        ...mountOptions,
        props: {
          trajectory: [],
        },
      })

      // Should still draw robot direction and legend, but not trajectory points
      const arcCallsAfter = canvasMock.arc.mock.calls.length
      // Trajectory would add multiple arc calls if it had points
      expect(arcCallsAfter).toBeLessThan(5)
    })

    it('draws orientation indicator when orientation is provided', () => {
      mount(EnvironmentVisualization, {
        ...mountOptions,
        props: {
          robotPosition: { x: 1, y: 1 },
          robotOrientation: 1,
        },
      })

      expect(canvasMock.lineTo).toHaveBeenCalled()
    })

    it('draws patrol range overlay when patrol radius is set', () => {
      mount(EnvironmentVisualization, {
        ...mountOptions,
        props: {
          robotPosition: { x: 1, y: 1 },
          patrolRadius: 2,
        },
      })

      expect(canvasMock.setLineDash).toHaveBeenCalled()
    })
  })

  describe('Reactivity', () => {
    it('redraws when robot position changes', async () => {
      const wrapper = mount(EnvironmentVisualization, {
        ...mountOptions,
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
        ...mountOptions,
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
        ...mountOptions,
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
        ...mountOptions,
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

    it('redraws when trajectory changes', async () => {
      const wrapper = mount(EnvironmentVisualization, {
        ...mountOptions,
        props: {
          trajectory: [
            { x: 0, y: 0 },
            { x: 1, y: 1 },
          ],
        },
      })

      canvasMock.clearRect.mockClear()

      await wrapper.setProps({
        trajectory: [
          { x: 0, y: 0 },
          { x: 1, y: 1 },
          { x: 2, y: 2 },
        ],
      })
      await nextTick()

      expect(canvasMock.clearRect).toHaveBeenCalled()
    })
  })

  describe('getThreatColor', () => {
    it('returns gray for zero threat level', () => {
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

  describe('Edge Cases', () => {
    it('handles undefined threat grid cells', () => {
      mount(EnvironmentVisualization, {
        ...mountOptions,
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
        ...mountOptions,
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
        ...mountOptions,
        props: {
          robotPosition: { x: 1.7, y: 2.3 },
        },
      })

      expect(canvasMock.arc).toHaveBeenCalled()
    })
  })

  describe('Interactive Zoom Functionality', () => {
    it('initializes with default scale of 1.0', () => {
      const wrapper = mount(EnvironmentVisualization, mountOptions)
      const vm = wrapper.vm as any

      expect(vm.scale).toBe(1.0)
    })

    it('increases scale on wheel up event', async () => {
      const wrapper = mount(EnvironmentVisualization, mountOptions)
      const canvas = wrapper.find('canvas')
      const vm = wrapper.vm as any

      await canvas.trigger('wheel', { deltaY: -100 })

      expect(vm.scale).toBeGreaterThan(1.0)
    })

    it('decreases scale on wheel down event', async () => {
      const wrapper = mount(EnvironmentVisualization, mountOptions)
      const canvas = wrapper.find('canvas')
      const vm = wrapper.vm as any

      await canvas.trigger('wheel', { deltaY: 100 })

      expect(vm.scale).toBeLessThan(1.0)
    })

    it('restricts minimum scale to 0.5', async () => {
      const wrapper = mount(EnvironmentVisualization, mountOptions)
      const canvas = wrapper.find('canvas')
      const vm = wrapper.vm as any

      // Zoom out excessively
      for (let i = 0; i < 20; i++) {
        await canvas.trigger('wheel', { deltaY: 100 })
      }

      expect(vm.scale).toBeGreaterThanOrEqual(0.5)
    })

    it('restricts maximum scale to 3.0', async () => {
      const wrapper = mount(EnvironmentVisualization, mountOptions)
      const canvas = wrapper.find('canvas')
      const vm = wrapper.vm as any

      // Zoom in excessively
      for (let i = 0; i < 20; i++) {
        await canvas.trigger('wheel', { deltaY: -100 })
      }

      expect(vm.scale).toBeLessThanOrEqual(3.0)
    })

    it('applies scale transformation to canvas context', async () => {
      canvasMock.scale = vi.fn()
      canvasMock.translate = vi.fn()
      canvasMock.save = vi.fn()
      canvasMock.restore = vi.fn()

      const wrapper = mount(EnvironmentVisualization, mountOptions)
      const canvas = wrapper.find('canvas')

      await canvas.trigger('wheel', { deltaY: -100 })
      await nextTick()

      expect(canvasMock.save).toHaveBeenCalled()
      expect(canvasMock.scale).toHaveBeenCalled()
      expect(canvasMock.restore).toHaveBeenCalled()
    })
  })

  describe('Interactive Pan Functionality', () => {
    it('initializes with offsetX and offsetY at 0', () => {
      const wrapper = mount(EnvironmentVisualization, mountOptions)
      const vm = wrapper.vm as any

      expect(vm.offsetX).toBe(0)
      expect(vm.offsetY).toBe(0)
    })

    it('sets isPanning to true on mousedown', async () => {
      const wrapper = mount(EnvironmentVisualization, mountOptions)
      const canvas = wrapper.find('canvas')
      const vm = wrapper.vm as any

      await canvas.trigger('mousedown', { clientX: 100, clientY: 100 })

      expect(vm.isPanning).toBe(true)
    })

    it('updates offset on mousemove while panning', async () => {
      const wrapper = mount(EnvironmentVisualization, mountOptions)
      const canvas = wrapper.find('canvas')
      const vm = wrapper.vm as any

      await canvas.trigger('mousedown', { clientX: 100, clientY: 100 })
      await canvas.trigger('mousemove', { clientX: 150, clientY: 150 })

      expect(vm.offsetX).not.toBe(0)
      expect(vm.offsetY).not.toBe(0)
    })

    it('does not update offset on mousemove when not panning', async () => {
      const wrapper = mount(EnvironmentVisualization, mountOptions)
      const canvas = wrapper.find('canvas')
      const vm = wrapper.vm as any

      // No mousedown
      await canvas.trigger('mousemove', { clientX: 150, clientY: 150 })

      expect(vm.offsetX).toBe(0)
      expect(vm.offsetY).toBe(0)
    })

    it('sets isPanning to false on mouseup', async () => {
      const wrapper = mount(EnvironmentVisualization, mountOptions)
      const canvas = wrapper.find('canvas')
      const vm = wrapper.vm as any

      await canvas.trigger('mousedown', { clientX: 100, clientY: 100 })
      await canvas.trigger('mouseup')

      expect(vm.isPanning).toBe(false)
    })

    it('sets isPanning to false on mouseleave', async () => {
      const wrapper = mount(EnvironmentVisualization, mountOptions)
      const canvas = wrapper.find('canvas')
      const vm = wrapper.vm as any

      await canvas.trigger('mousedown', { clientX: 100, clientY: 100 })
      await canvas.trigger('mouseleave')

      expect(vm.isPanning).toBe(false)
    })

    it('applies pan offset transformation to canvas context', async () => {
      canvasMock.translate = vi.fn()
      canvasMock.save = vi.fn()
      canvasMock.restore = vi.fn()

      const wrapper = mount(EnvironmentVisualization, mountOptions)
      const canvas = wrapper.find('canvas')

      await canvas.trigger('mousedown', { clientX: 100, clientY: 100 })
      await canvas.trigger('mousemove', { clientX: 150, clientY: 150 })
      await nextTick()

      expect(canvasMock.translate).toHaveBeenCalled()
    })
  })

  describe('Reset View Functionality', () => {
    it('exposes resetView method', () => {
      const wrapper = mount(EnvironmentVisualization, mountOptions)
      const vm = wrapper.vm as any

      expect(vm.resetView).toBeDefined()
      expect(typeof vm.resetView).toBe('function')
    })

    it('resets scale to 1.0 when resetView is called', async () => {
      const wrapper = mount(EnvironmentVisualization, mountOptions)
      const canvas = wrapper.find('canvas')
      const vm = wrapper.vm as any

      // Zoom in first
      await canvas.trigger('wheel', { deltaY: -100 })
      expect(vm.scale).toBeGreaterThan(1.0)

      // Reset
      vm.resetView()

      expect(vm.scale).toBe(1.0)
    })

    it('resets offsets to 0 when resetView is called', async () => {
      const wrapper = mount(EnvironmentVisualization, mountOptions)
      const canvas = wrapper.find('canvas')
      const vm = wrapper.vm as any

      // Pan first
      await canvas.trigger('mousedown', { clientX: 100, clientY: 100 })
      await canvas.trigger('mousemove', { clientX: 150, clientY: 150 })
      expect(vm.offsetX).not.toBe(0)

      // Reset
      vm.resetView()

      expect(vm.offsetX).toBe(0)
      expect(vm.offsetY).toBe(0)
    })

    it('triggers redraw when resetView is called', () => {
      const wrapper = mount(EnvironmentVisualization, mountOptions)
      const vm = wrapper.vm as any

      canvasMock.clearRect.mockClear()

      vm.resetView()

      expect(canvasMock.clearRect).toHaveBeenCalled()
    })
  })
})

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useChart } from '~/composables/useChart'
import type { Chart, ChartConfiguration } from 'chart.js/auto'

describe('useChart', () => {
  let mockChart: Partial<Chart>
  let mockChartConstructor: any
  let mockCanvas: HTMLCanvasElement

  beforeEach(() => {
    // モックChartインスタンス
    mockChart = {
      destroy: vi.fn(),
      update: vi.fn(),
    }

    // モックChartコンストラクタ
    mockChartConstructor = vi.fn(() => mockChart)

    // モックCanvas要素
    mockCanvas = document.createElement('canvas')
  })

  describe('initialization', () => {
    it('creates chart with provided configuration', () => {
      const mockConfig: ChartConfiguration = {
        type: 'line',
        data: {
          labels: ['A', 'B', 'C'],
          datasets: [
            {
              label: 'Test Dataset',
              data: [1, 2, 3],
            },
          ],
        },
      }

      const { canvas, render } = useChart(mockConfig, mockChartConstructor)

      // canvas要素を設定してレンダリング
      canvas.value = mockCanvas
      render()

      expect(mockChartConstructor).toHaveBeenCalledWith(mockCanvas, mockConfig)
    })

    it('does not create chart if canvas is null', () => {
      const mockConfig: ChartConfiguration = {
        type: 'bar',
        data: { labels: [], datasets: [] },
      }

      const { render } = useChart(mockConfig, mockChartConstructor)

      render()

      expect(mockChartConstructor).not.toHaveBeenCalled()
    })
  })

  describe('render', () => {
    it('destroys existing chart before creating new one', () => {
      const mockConfig: ChartConfiguration = {
        type: 'line',
        data: { labels: [], datasets: [] },
      }

      const { canvas, render } = useChart(mockConfig, mockChartConstructor)
      canvas.value = mockCanvas

      // 初回レンダリング
      render()
      expect(mockChartConstructor).toHaveBeenCalledTimes(1)

      // 2回目のレンダリング
      render()
      expect(mockChart.destroy).toHaveBeenCalled()
      expect(mockChartConstructor).toHaveBeenCalledTimes(2)
    })

    it('can be called multiple times safely', () => {
      const mockConfig: ChartConfiguration = {
        type: 'pie',
        data: { labels: [], datasets: [] },
      }

      const { canvas, render } = useChart(mockConfig, mockChartConstructor)
      canvas.value = mockCanvas

      render()
      render()
      render()

      expect(mockChartConstructor).toHaveBeenCalledTimes(3)
      expect(mockChart.destroy).toHaveBeenCalledTimes(2) // 初回以外
    })
  })

  describe('destroy', () => {
    it('provides destroy function to clean up chart', () => {
      const mockConfig: ChartConfiguration = {
        type: 'doughnut',
        data: { labels: [], datasets: [] },
      }

      const { canvas, render, destroy } = useChart(mockConfig, mockChartConstructor)
      canvas.value = mockCanvas

      render()
      destroy()

      expect(mockChart.destroy).toHaveBeenCalled()
    })

    it('handles destroy when chart is null', () => {
      const mockConfig: ChartConfiguration = {
        type: 'radar',
        data: { labels: [], datasets: [] },
      }

      const { destroy } = useChart(mockConfig, mockChartConstructor)

      // destroyを呼んでもエラーにならない
      expect(() => destroy()).not.toThrow()
    })
  })

  describe('initial state', () => {
    it('has null canvas initially', () => {
      const mockConfig: ChartConfiguration = {
        type: 'bar',
        data: { labels: [], datasets: [] },
      }

      const { canvas } = useChart(mockConfig, mockChartConstructor)

      expect(canvas.value).toBeNull()
    })
  })
})

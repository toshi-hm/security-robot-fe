import { ref } from 'vue'
import { Chart, type ChartConfiguration } from 'chart.js/auto'

/**
 * Chart管理Composable
 *
 * 依存性注入パターンでテスタビリティを確保
 * @param config - Chart.js設定
 * @param ChartConstructor - Chartコンストラクタ (テスト時はモック注入可能)
 */
export const useChart = (
  config: ChartConfiguration,
  ChartConstructor: typeof Chart = Chart
) => {
  const canvas = ref<HTMLCanvasElement | null>(null)
  let chart: Chart | null = null

  const render = () => {
    if (canvas.value) {
      chart?.destroy()
      chart = new ChartConstructor(canvas.value, config)
    }
  }

  const destroy = () => {
    chart?.destroy()
    chart = null
  }

  // ライフサイクルフック（実際のコンポーネント内でのみ動作）
  if (typeof onMounted !== 'undefined') {
    onMounted(render)
  }

  if (typeof onBeforeUnmount !== 'undefined') {
    onBeforeUnmount(destroy)
  }

  return {
    canvas,
    render,
    destroy,
  }
}

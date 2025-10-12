import { Chart, type ChartConfiguration } from 'chart.js/auto'
import { ref } from 'vue'

/**
 * Chart管理Composable
 *
 * 依存性注入パターンでテスタビリティを確保
 * @param config - Chart.js設定
 * @param ChartConstructor - Chartコンストラクタ (テスト時はモック注入可能)
 */
export const useChart = (config: ChartConfiguration, ChartConstructor: typeof Chart = Chart) => {
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

  /**
   * チャートデータをリアルタイム更新
   * @param datasetIndex - 更新するデータセットのインデックス
   * @param newData - 新しいデータポイント
   * @param newLabel - 新しいラベル（オプション）
   * @param maxDataPoints - 保持する最大データポイント数（デフォルト: 100）
   */
  const updateData = (datasetIndex: number, newData: number, newLabel?: string, maxDataPoints: number = 100) => {
    if (!chart) return

    // ラベルを追加（指定された場合）
    if (newLabel && chart.data.labels) {
      chart.data.labels.push(newLabel)
      if (chart.data.labels.length > maxDataPoints) {
        chart.data.labels.shift()
      }
    }

    // データを追加
    const dataset = chart.data.datasets[datasetIndex]
    if (dataset && Array.isArray(dataset.data)) {
      dataset.data.push(newData)
      if (dataset.data.length > maxDataPoints) {
        dataset.data.shift()
      }
    }

    // チャートを更新
    chart.update('none') // アニメーションなしで更新（パフォーマンス向上）
  }

  /**
   * チャートデータを完全に置き換え
   * @param labels - 新しいラベル配列
   * @param datasets - 新しいデータセット配列
   */
  const replaceData = (labels: string[], datasets: Array<{ data: number[] }>) => {
    if (!chart) return

    chart.data.labels = labels
    datasets.forEach((dataset, index) => {
      if (chart!.data.datasets[index]) {
        chart!.data.datasets[index].data = dataset.data
      }
    })

    chart.update()
  }

  /**
   * チャートをクリア
   */
  const clearData = () => {
    if (!chart) return

    chart.data.labels = []
    chart.data.datasets.forEach((dataset) => {
      if (Array.isArray(dataset.data)) {
        dataset.data = []
      }
    })

    chart.update()
  }

  /**
   * チャートインスタンスを取得（テスト用）
   */
  const getChart = () => chart

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
    updateData,
    replaceData,
    clearData,
    getChart,
  }
}

import { Chart, type ChartConfiguration } from 'chart.js/auto'

export const useChart = (config: ChartConfiguration) => {
  const canvas = ref<HTMLCanvasElement | null>(null)
  let chart: Chart | null = null

  const render = () => {
    if (canvas.value) {
      chart?.destroy()
      chart = new Chart(canvas.value, config)
    }
  }

  onMounted(render)
  onBeforeUnmount(() => chart?.destroy())

  return {
    canvas,
    render,
  }
}

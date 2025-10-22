<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'

interface Props {
  gridWidth?: number
  gridHeight?: number
  robotPosition?: { x: number; y: number } | null
  coverageMap?: boolean[][]
  threatGrid?: number[][]
  trajectory?: Array<{ x: number; y: number }>
}

const props = withDefaults(defineProps<Props>(), {
  gridWidth: 8,
  gridHeight: 8,
  robotPosition: null,
  coverageMap: () => [],
  threatGrid: () => [],
  trajectory: () => [],
})

const canvas = ref<HTMLCanvasElement | null>(null)
const cellSize = 60 // pixels per cell

// Computed canvas dimensions
const canvasWidth = computed(() => props.gridWidth * cellSize)
const canvasHeight = computed(() => props.gridHeight * cellSize)

/**
 * Draw the environment grid on canvas
 */
const drawEnvironment = () => {
  if (!canvas.value) return

  const ctx = canvas.value.getContext('2d')
  if (!ctx) return

  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)

  // Draw grid cells with threat level heatmap
  for (let y = 0; y < props.gridHeight; y++) {
    for (let x = 0; x < props.gridWidth; x++) {
      const cellX = x * cellSize
      const cellY = y * cellSize

      // Draw threat level background (heatmap)
      const threatLevel = props.threatGrid[y]?.[x] ?? 0
      const heatColor = getThreatColor(threatLevel)
      ctx.fillStyle = heatColor
      ctx.fillRect(cellX, cellY, cellSize, cellSize)

      // Draw coverage overlay (visited cells)
      if (props.coverageMap[y]?.[x]) {
        ctx.fillStyle = 'rgba(0, 255, 0, 0.2)' // Green overlay for visited
        ctx.fillRect(cellX, cellY, cellSize, cellSize)
      }

      // Draw grid lines
      ctx.strokeStyle = '#999'
      ctx.lineWidth = 1
      ctx.strokeRect(cellX, cellY, cellSize, cellSize)
    }
  }

  // Draw robot trajectory
  drawTrajectory(ctx)

  // Draw robot position
  if (props.robotPosition) {
    const robotX = Math.floor(props.robotPosition.x) * cellSize + cellSize / 2
    const robotY = Math.floor(props.robotPosition.y) * cellSize + cellSize / 2

    // Robot body (circle)
    ctx.fillStyle = '#409eff'
    ctx.beginPath()
    ctx.arc(robotX, robotY, cellSize / 3, 0, Math.PI * 2)
    ctx.fill()

    // Robot border
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 3
    ctx.stroke()

    // Robot direction indicator (small circle)
    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(robotX, robotY - cellSize / 6, cellSize / 10, 0, Math.PI * 2)
    ctx.fill()
  }

  // Draw legend
  drawLegend(ctx)
}

/**
 * Get color for threat level (heatmap)
 * @param level - Threat level 0.0 to 1.0
 */
const getThreatColor = (level: number): string => {
  if (level === 0) return '#f0f0f0' // Gray for no threat

  // Interpolate from yellow (low) to red (high)
  const red = Math.floor(255)
  const green = Math.floor(255 * (1 - level))
  const blue = 0

  return `rgb(${red}, ${green}, ${blue})`
}

/**
 * Draw robot trajectory (path history)
 */
const drawTrajectory = (ctx: CanvasRenderingContext2D) => {
  if (!props.trajectory || props.trajectory.length === 0) return

  // Draw trajectory path
  ctx.strokeStyle = 'rgba(64, 158, 255, 0.3)' // Light blue with transparency
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  ctx.beginPath()
  props.trajectory.forEach((pos, index) => {
    const x = Math.floor(pos.x) * cellSize + cellSize / 2
    const y = Math.floor(pos.y) * cellSize + cellSize / 2

    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  ctx.stroke()

  // Draw trajectory points (fade from old to recent)
  props.trajectory.forEach((pos, index) => {
    const x = Math.floor(pos.x) * cellSize + cellSize / 2
    const y = Math.floor(pos.y) * cellSize + cellSize / 2

    // Calculate opacity based on position in trajectory (older = more transparent)
    const opacity = 0.2 + (index / props.trajectory.length) * 0.6

    ctx.fillStyle = `rgba(64, 158, 255, ${opacity})`
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fill()

    // White border for visibility
    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`
    ctx.lineWidth = 1
    ctx.stroke()
  })
}

/**
 * Draw legend for threat levels and coverage
 */
const drawLegend = (ctx: CanvasRenderingContext2D) => {
  const legendX = 10
  const legendY = canvasHeight.value - 100

  // Legend background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
  ctx.fillRect(legendX, legendY, 150, 90)
  ctx.strokeStyle = '#999'
  ctx.strokeRect(legendX, legendY, 150, 90)

  // Threat level legend
  ctx.fillStyle = '#000'
  ctx.font = '12px sans-serif'
  ctx.fillText('Threat Level:', legendX + 5, legendY + 15)

  // Low threat
  ctx.fillStyle = getThreatColor(0.2)
  ctx.fillRect(legendX + 5, legendY + 20, 20, 15)
  ctx.fillStyle = '#000'
  ctx.fillText('Low', legendX + 30, legendY + 32)

  // High threat
  ctx.fillStyle = getThreatColor(0.9)
  ctx.fillRect(legendX + 70, legendY + 20, 20, 15)
  ctx.fillStyle = '#000'
  ctx.fillText('High', legendX + 95, legendY + 32)

  // Coverage legend
  ctx.fillStyle = 'rgba(0, 255, 0, 0.3)'
  ctx.fillRect(legendX + 5, legendY + 45, 20, 15)
  ctx.fillStyle = '#000'
  ctx.fillText('Visited', legendX + 30, legendY + 57)

  // Trajectory legend
  ctx.strokeStyle = 'rgba(64, 158, 255, 0.5)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(legendX + 5, legendY + 72)
  ctx.lineTo(legendX + 25, legendY + 72)
  ctx.stroke()
  ctx.fillStyle = '#000'
  ctx.fillText('Trajectory', legendX + 30, legendY + 77)
}

// Watch for prop changes and redraw
watch(
  () => [props.robotPosition, props.coverageMap, props.threatGrid, props.gridWidth, props.gridHeight, props.trajectory],
  () => {
    drawEnvironment()
  },
  { deep: true }
)

onMounted(() => {
  drawEnvironment()
})
</script>

<template>
  <div class="environment-visualization">
    <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight" class="environment-visualization__canvas" />
  </div>
</template>

<style lang="scss" scoped>
.environment-visualization {
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  width: 100%;

  &__canvas {
    background-color: #fff;
    border: 2px solid #ddd;
    border-radius: 4px;
  }
}
</style>

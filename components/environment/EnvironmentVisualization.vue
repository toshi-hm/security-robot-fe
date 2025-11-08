<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'

import type { Position } from '~/libs/domains/common/Position'

interface Props {
  gridWidth?: number
  gridHeight?: number
  robotPosition?: Position | null
  coverageMap?: number[][] | boolean[][]
  threatGrid?: number[][]
  trajectory?: Position[]
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

// Zoom and pan state
const scale = ref(1.0)
const offsetX = ref(0)
const offsetY = ref(0)
const isPanning = ref(false)
const panStart = ref({ x: 0, y: 0 })

/**
 * Handle mouse wheel event for zooming
 */
const handleWheel = (event: WheelEvent) => {
  event.preventDefault()

  const zoomSpeed = 0.1
  const delta = event.deltaY > 0 ? -zoomSpeed : zoomSpeed

  // Update scale with min/max constraints
  scale.value = Math.max(0.5, Math.min(3.0, scale.value + delta))

  drawEnvironment()
}

/**
 * Handle mouse down event for panning start
 */
const handleMouseDown = (event: MouseEvent) => {
  isPanning.value = true
  panStart.value = {
    x: event.clientX - offsetX.value,
    y: event.clientY - offsetY.value,
  }
}

/**
 * Handle mouse move event for panning
 */
const handleMouseMove = (event: MouseEvent) => {
  if (!isPanning.value) return

  offsetX.value = event.clientX - panStart.value.x
  offsetY.value = event.clientY - panStart.value.y

  drawEnvironment()
}

/**
 * Handle mouse up event for panning end
 */
const handleMouseUp = () => {
  isPanning.value = false
}

/**
 * Handle mouse leave event for panning end
 */
const handleMouseLeave = () => {
  isPanning.value = false
}

/**
 * Reset view to default zoom and pan
 */
const resetView = () => {
  scale.value = 1.0
  offsetX.value = 0
  offsetY.value = 0
  drawEnvironment()
}

/**
 * Draw the environment grid on canvas
 */
const drawEnvironment = () => {
  if (!canvas.value) return

  const ctx = canvas.value.getContext('2d')
  if (!ctx) return

  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth.value, canvasHeight.value)

  // Apply transformations (zoom and pan)
  ctx.save()
  ctx.translate(offsetX.value, offsetY.value)
  ctx.scale(scale.value, scale.value)

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
      const cellValue = props.coverageMap[y]?.[x]
      const isVisited = typeof cellValue === 'number' ? cellValue > 0 : Boolean(cellValue)
      if (isVisited) {
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

  // Restore canvas context
  ctx.restore()
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

// Watch for prop changes and redraw
watch(
  () => [props.robotPosition, props.coverageMap, props.threatGrid, props.gridWidth, props.gridHeight, props.trajectory],
  () => {
    drawEnvironment()
  }
)

onMounted(() => {
  drawEnvironment()
})
</script>

<template>
  <div class="environment-visualization">
    <div class="environment-visualization__canvas-wrapper">
      <canvas
        ref="canvas"
        :width="canvasWidth"
        :height="canvasHeight"
        class="environment-visualization__canvas"
        @wheel="handleWheel"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseLeave"
      />
      <el-button class="environment-visualization__reset-button" size="small" @click="resetView">
        Reset View
      </el-button>
    </div>

    <!-- Legend as HTML -->
    <div class="environment-visualization__legend">
      <div class="environment-visualization__legend-section">
        <span class="environment-visualization__legend-title">Threat Level:</span>
        <div class="environment-visualization__legend-items">
          <div class="environment-visualization__legend-item">
            <span class="environment-visualization__legend-color environment-visualization__legend-color--threat-low" />
            <span>Low</span>
          </div>
          <div class="environment-visualization__legend-item">
            <span
              class="environment-visualization__legend-color environment-visualization__legend-color--threat-high"
            />
            <span>High</span>
          </div>
        </div>
      </div>
      <div class="environment-visualization__legend-section">
        <div class="environment-visualization__legend-item">
          <span class="environment-visualization__legend-color environment-visualization__legend-color--visited" />
          <span>Visited</span>
        </div>
      </div>
      <div class="environment-visualization__legend-section">
        <div class="environment-visualization__legend-item">
          <span class="environment-visualization__legend-line" />
          <span>Trajectory</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.environment-visualization {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  width: 100%;

  &__canvas-wrapper {
    align-items: center;
    display: flex;
    justify-content: center;
    overflow: auto;
    position: relative;
  }

  &__canvas {
    background-color: #fff;
    border: 2px solid #ddd;
    border-radius: 4px;
    cursor: grab;
    max-width: 100%;

    &:active {
      cursor: grabbing;
    }
  }

  &__reset-button {
    position: absolute;
    right: 20px;
    top: 20px;
  }

  &__legend {
    background-color: rgb(255 255 255 / 0.95);
    border: 1px solid #ddd;
    border-radius: 8px;
    display: flex;
    gap: 24px;
    padding: 12px 16px;
  }

  &__legend-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__legend-title {
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 4px;
  }

  &__legend-items {
    display: flex;
    gap: 16px;
  }

  &__legend-item {
    align-items: center;
    display: flex;
    font-size: 12px;
    gap: 6px;
  }

  &__legend-color {
    border: 1px solid #999;
    display: inline-block;
    height: 16px;
    width: 20px;

    &--threat-low {
      background: linear-gradient(to right, #ff0, #fc0);
    }

    &--threat-high {
      background: linear-gradient(to right, #f60, #f00);
    }

    &--visited {
      background-color: rgb(0 255 0 / 0.3);
    }
  }

  &__legend-line {
    background: linear-gradient(to right, rgb(64 158 255 / 0.5) 0%, rgb(64 158 255 / 0.5) 100%);
    border-radius: 2px;
    display: inline-block;
    height: 3px;
    width: 20px;
  }
}
</style>

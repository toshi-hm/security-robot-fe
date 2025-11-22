<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'

import { DEFAULT_PATROL_RADIUS } from '~/configs/constants'
import type { Position } from '~/libs/domains/common/Position'

interface Props {
  gridWidth?: number
  gridHeight?: number
  robotPosition?: Position | null
  robotOrientation?: number | null
  coverageMap?: number[][] | boolean[][]
  threatGrid?: number[][]
  obstacles?: boolean[][] | null // 障害物マップ
  trajectory?: Position[]
  patrolRadius?: number
  chargingStationPosition?: Position | null // バッテリーシステム (Session 050)
}

interface TrajectoryColors {
  line: string
  point: string
  pointBorder: string
}

const props = withDefaults(defineProps<Props>(), {
  gridWidth: 8,
  gridHeight: 8,
  robotPosition: null,
  coverageMap: () => [],
  threatGrid: () => [],
  obstacles: null,
  trajectory: () => [],
  robotOrientation: null,
  patrolRadius: DEFAULT_PATROL_RADIUS,
  chargingStationPosition: null,
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

const normalizeOrientation = (orientation: number | null | undefined): number | null => {
  if (typeof orientation !== 'number' || Number.isNaN(orientation)) return null
  const normalized = Math.round(orientation) % 4
  return normalized < 0 ? normalized + 4 : normalized
}

const drawEnvironment = () => {
  if (!canvas.value) return

  const ctx = canvas.value.getContext('2d')
  if (!ctx) return

  const rootStyle = getComputedStyle(document.documentElement)
  const visitedCellColor = rootStyle.getPropertyValue('--color-bg-visited-cell').trim() || 'rgba(0, 255, 0, 0.2)'
  const gridBorderColor = rootStyle.getPropertyValue('--color-border-grid').trim() || '#999'
  const robotBodyColor = rootStyle.getPropertyValue('--color-robot-body').trim() || '#409eff'
  const robotBorderColor = rootStyle.getPropertyValue('--color-robot-border').trim() || '#fff'
  const robotDirectionColor = rootStyle.getPropertyValue('--color-robot-direction-indicator').trim() || '#fff'
  const patrolRangeFillColor =
    rootStyle.getPropertyValue('--color-patrol-range-fill').trim() || 'rgba(64, 158, 255, 0.12)'
  const patrolRangeStrokeColor =
    rootStyle.getPropertyValue('--color-patrol-range-stroke').trim() || 'rgba(64, 158, 255, 0.65)'
  const trajectoryColors: TrajectoryColors = {
    line: rootStyle.getPropertyValue('--color-trajectory-line').trim() || 'rgba(64, 158, 255, 0.3)',
    point: rootStyle.getPropertyValue('--color-trajectory-point').trim() || 'rgb(64 158 255)',
    pointBorder: rootStyle.getPropertyValue('--color-trajectory-point-border').trim() || 'rgb(255 255 255)',
  }

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

      // Check if this cell is an obstacle
      const isObstacle = props.obstacles?.[y]?.[x] ?? false

      if (isObstacle) {
        // Draw obstacle as dark gray/black cell
        ctx.fillStyle = '#2c3e50' // Dark gray for obstacles
        ctx.fillRect(cellX, cellY, cellSize, cellSize)
      } else {
        // Draw threat level background (heatmap)
        const threatLevel = props.threatGrid[y]?.[x] ?? 0
        const heatColor = getThreatColor(threatLevel)
        ctx.fillStyle = heatColor
        ctx.fillRect(cellX, cellY, cellSize, cellSize)

        // Draw coverage overlay (visited cells)
        const cellValue = props.coverageMap[y]?.[x]
        const isVisited = typeof cellValue === 'number' ? cellValue > 0 : Boolean(cellValue)
        if (isVisited) {
          ctx.fillStyle = visitedCellColor // Green overlay for visited
          ctx.fillRect(cellX, cellY, cellSize, cellSize)
        }
      }

      // Draw grid lines
      ctx.strokeStyle = gridBorderColor
      ctx.lineWidth = 1
      ctx.strokeRect(cellX, cellY, cellSize, cellSize)
    }
  }

  // Draw charging station (before robot)
  if (props.chargingStationPosition) {
    const stationX = Math.floor(props.chargingStationPosition.x) * cellSize + cellSize / 2
    const stationY = Math.floor(props.chargingStationPosition.y) * cellSize + cellSize / 2
    drawChargingStation(ctx, stationX, stationY)
  }

  // Draw robot trajectory
  drawTrajectory(ctx, trajectoryColors)

  // Draw robot position
  if (props.robotPosition) {
    const robotX = Math.floor(props.robotPosition.x) * cellSize + cellSize / 2
    const robotY = Math.floor(props.robotPosition.y) * cellSize + cellSize / 2

    drawPatrolRange(ctx, robotX, robotY, patrolRangeFillColor, patrolRangeStrokeColor)

    // Robot body (circle)
    ctx.fillStyle = robotBodyColor
    ctx.beginPath()
    ctx.arc(robotX, robotY, cellSize / 3, 0, Math.PI * 2)
    ctx.fill()

    // Robot border
    ctx.strokeStyle = robotBorderColor
    ctx.lineWidth = 3
    ctx.stroke()

    // Robot direction indicator (small circle)
    drawOrientationIndicator(ctx, robotX, robotY, robotDirectionColor)
  }

  // Restore canvas context
  ctx.restore()
}

/**
 * Get color for threat level (heatmap)
 * @param level - Threat level 0.0 to 1.0
 */
const getThreatColor = (level: number): string => {
  if (level === 0) return 'var(--color-bg-no-threat)' // Gray for no threat

  // Interpolate from yellow (low) to red (high)
  const red = Math.floor(255)
  const green = Math.floor(255 * (1 - level))
  const blue = 0

  return `rgb(${red}, ${green}, ${blue})`
}

/**
 * Draw robot trajectory (path history)
 */
const drawTrajectory = (ctx: CanvasRenderingContext2D, colors: TrajectoryColors) => {
  if (!props.trajectory || props.trajectory.length === 0) return

  // Draw trajectory path
  ctx.strokeStyle = colors.line // Light blue with transparency
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

    ctx.save()
    ctx.globalAlpha = Math.min(1, Math.max(0, opacity))

    ctx.fillStyle = colors.point
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fill()

    // White border for visibility
    ctx.strokeStyle = colors.pointBorder
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.restore()
  })
}

const drawOrientationIndicator = (ctx: CanvasRenderingContext2D, robotX: number, robotY: number, color: string) => {
  const orientation = normalizeOrientation(props.robotOrientation)
  if (orientation === null) {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(robotX, robotY - cellSize / 6, cellSize / 10, 0, Math.PI * 2)
    ctx.fill()
    return
  }

  const vectors: Array<{ dx: number; dy: number }> = [
    { dx: 0, dy: -1 }, // 北
    { dx: 1, dy: 0 }, // 東
    { dx: 0, dy: 1 }, // 南
    { dx: -1, dy: 0 }, // 西
  ]
  const vector = (vectors[orientation] ?? vectors[0])!
  const { dx, dy } = vector
  const arrowLength = cellSize * 0.45
  const startX = robotX
  const startY = robotY
  const endX = startX + dx * arrowLength
  const endY = startY + dy * arrowLength

  ctx.strokeStyle = color
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(startX, startY)
  ctx.lineTo(endX, endY)
  ctx.stroke()

  // Arrow head
  const headLength = 10
  const angle = Math.atan2(dy, dx)
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(endX, endY)
  ctx.lineTo(endX - headLength * Math.cos(angle - Math.PI / 6), endY - headLength * Math.sin(angle - Math.PI / 6))
  ctx.lineTo(endX - headLength * Math.cos(angle + Math.PI / 6), endY - headLength * Math.sin(angle + Math.PI / 6))
  ctx.closePath()
  ctx.fill()
}

const drawPatrolRange = (
  ctx: CanvasRenderingContext2D,
  robotX: number,
  robotY: number,
  fillColor: string,
  strokeColor: string
) => {
  if (!props.patrolRadius || props.patrolRadius <= 0) return

  const radius = props.patrolRadius * cellSize
  ctx.save()
  ctx.lineWidth = 2
  ctx.fillStyle = fillColor
  ctx.beginPath()
  ctx.arc(robotX, robotY, radius, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = strokeColor
  if (typeof ctx.setLineDash === 'function') {
    ctx.setLineDash([8, 6])
  }
  ctx.beginPath()
  ctx.arc(robotX, robotY, radius, 0, Math.PI * 2)
  ctx.stroke()
  if (typeof ctx.setLineDash === 'function') {
    ctx.setLineDash([])
  }
  ctx.restore()
}

/**
 * Draw charging station icon (battery symbol with lightning bolt)
 */
const drawChargingStation = (ctx: CanvasRenderingContext2D, stationX: number, stationY: number) => {
  const size = cellSize * 0.7 // Station size relative to cell

  // Draw background circle (green)
  ctx.fillStyle = '#67c23a' // Element Plus success color
  ctx.beginPath()
  ctx.arc(stationX, stationY, size / 2, 0, Math.PI * 2)
  ctx.fill()

  // Draw border
  ctx.strokeStyle = '#fff'
  ctx.lineWidth = 3
  ctx.stroke()

  // Draw lightning bolt symbol (⚡)
  ctx.fillStyle = '#fff'
  ctx.font = `bold ${size * 0.6}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('⚡', stationX, stationY)
}

// Watch for prop changes and redraw
watch(
  () => [
    props.robotPosition,
    props.robotOrientation,
    props.coverageMap,
    props.threatGrid,
    props.obstacles,
    props.gridWidth,
    props.gridHeight,
    props.trajectory,
    props.patrolRadius,
    props.chargingStationPosition,
  ],
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
          <span class="environment-visualization__legend-circle" />
          <span>警備範囲 ({{ patrolRadius }}セル)</span>
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
    background-color: var(--color-bg-canvas);
    border: 2px solid var(--color-border-canvas);
    border-radius: 4px;
    cursor: grab;
    display: block;
    max-height: 100%;
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
    background-color: var(--color-bg-legend);
    border: 1px solid var(--color-border-default);
    border-radius: 8px;
    color: var(--color-text-legend);
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
    border: 1px solid var(--color-border-legend-item);
    display: inline-block;
    height: 16px;
    width: 20px;

    &--threat-low {
      background: linear-gradient(
        to right,
        var(--color-threat-low-gradient-start),
        var(--color-threat-low-gradient-end)
      );
    }

    &--threat-high {
      background: linear-gradient(
        to right,
        var(--color-threat-high-gradient-start),
        var(--color-threat-high-gradient-end)
      );
    }

    &--visited {
      background-color: var(--color-bg-visited-cell);
    }
  }

  &__legend-circle {
    background-color: var(--color-patrol-range-fill);
    border: 2px dashed var(--color-patrol-range-stroke);
    border-radius: 50%;
    display: inline-block;
    height: 16px;
    width: 16px;
  }

  &__legend-line {
    background: var(--color-trajectory-legend);
    border-radius: 2px;
    display: inline-block;
    height: 3px;
    width: 20px;
  }
}
</style>

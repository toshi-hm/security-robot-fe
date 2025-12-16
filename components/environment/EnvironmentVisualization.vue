<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'

import { DEFAULT_PATROL_RADIUS } from '~/configs/constants'
import type { Position } from '~/libs/domains/common/Position'
import type { RobotState } from '~/libs/domains/environment/RobotState'

interface Props {
  gridWidth?: number
  gridHeight?: number
  robotPosition?: Position | null
  robotOrientation?: number | null
  robots?: RobotState[] // Multi-Agent Support
  coverageMap?: number[][] | boolean[][]
  threatGrid?: number[][]
  obstacles?: boolean[][] | null // 障害物マップ
  trajectories?: Record<number, Position[]> // Multi-Agent Support: Dictionary of trajectories by robot ID
  trajectory?: Position[] // Legacy support for single robot
  patrolRadius?: number
  chargingStationPosition?: Position | null // Legacy support
  chargingStations?: Position[] // Multi-Agent Support: List of charging stations
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
  robots: () => [],
  coverageMap: () => [],
  threatGrid: () => [],
  obstacles: null,
  trajectories: () => ({}),
  trajectory: () => [],
  robotOrientation: null,
  patrolRadius: DEFAULT_PATROL_RADIUS,
  chargingStationPosition: null,
  chargingStations: () => [],
})

// Computed robots to draw
const robotsToDraw = computed(() => {
  if (props.robots && props.robots.length > 0) {
    return props.robots.map((r, i) => ({
      x: r.x,
      y: r.y,
      orientation: r.orientation,
      id: r.id ?? i,
      // Default to 100% and not charging if not available
      battery: r.batteryPercentage ?? 100,
      isCharging: r.isCharging ?? false,
    }))
  } else if (props.robotPosition) {
    // Backward compatibility
    return [
      {
        x: props.robotPosition!.x,
        y: props.robotPosition!.y,
        orientation: props.robotOrientation ?? 0,
        id: 0,
        battery: 100,
        isCharging: false,
      },
    ]
  }
  return []
})

const canvas = ref<HTMLCanvasElement | null>(null)
const cellSize = 60 // pixels per cell

// Computed canvas dimensions
const canvasWidth = computed(() => props.gridWidth * cellSize)
const canvasHeight = computed(() => props.gridHeight * cellSize)

const canvasWrapper = ref<HTMLElement | null>(null)

// Zoom and pan state
const scale = ref(1.0)
const offsetX = ref(0)
const offsetY = ref(0)

/**
 * Fit the grid to the container view
 */
const fitToView = () => {
  // Reset to default scale (1.0) to fill the canvas internal resolution.
  // The CSS (width: 100%, height: 100%) and container aspect-ratio will handle the visual fitting.
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

const robotColors = ref<string[]>([])

const updateRobotColors = () => {
  const rootStyle = getComputedStyle(document.documentElement)
  robotColors.value = [
    rootStyle.getPropertyValue('--color-robot-body').trim() || '#409eff', // Blue (Default)
    '#67c23a', // Green
    '#e6a23c', // Orange
    '#f56c6c', // Red
    '#909399', // Gray
    '#a0cfff', // Light Blue
    '#b3e19d', // Light Green
    '#f3d19e', // Light Orange
  ]
}

const getRobotColor = (index: number): string => {
  if (robotColors.value.length === 0) return '#409EFF'
  return robotColors.value[index % robotColors.value.length] ?? '#409EFF'
}

const drawEnvironment = () => {
  if (!canvas.value) return

  const ctx = canvas.value.getContext('2d')
  if (!ctx) return

  const rootStyle = getComputedStyle(document.documentElement)
  const visitedCellColor = rootStyle.getPropertyValue('--color-bg-visited-cell').trim() || 'rgba(0, 255, 0, 0.2)'
  const gridBorderColor = rootStyle.getPropertyValue('--color-border-grid').trim() || '#999'
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
        const threatLevel = props.threatGrid?.[y]?.[x] ?? 0
        const heatColor = getThreatColor(threatLevel)
        ctx.fillStyle = heatColor
        ctx.fillRect(cellX, cellY, cellSize, cellSize)

        // Draw coverage overlay (visited cells)
        const cellValue = props.coverageMap?.[y]?.[x]
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

  // Draw charging stations (plural)
  if (props.chargingStations && props.chargingStations.length > 0) {
    props.chargingStations.forEach((pos) => {
      const stationX = Math.floor(pos.x) * cellSize + cellSize / 2
      const stationY = Math.floor(pos.y) * cellSize + cellSize / 2
      drawChargingStation(ctx, stationX, stationY)
    })
  } else if (props.chargingStationPosition) {
    // Legacy single charging station
    const stationX = Math.floor(props.chargingStationPosition.x) * cellSize + cellSize / 2
    const stationY = Math.floor(props.chargingStationPosition.y) * cellSize + cellSize / 2
    drawChargingStation(ctx, stationX, stationY)
  }

  // Unified trajectory drawing
  // Merge legacy single trajectory with multi-agent trajectories
  // We prioritize 'trajectories' (Record<number, Position[]>) but for color mapping we use helper

  // Determine robots to draw
  // robotsToDraw is now a computed property, accessed via .value
  const robots = robotsToDraw.value

  // Draw trajectories for all robots
  if (props.trajectories && Object.keys(props.trajectories).length > 0) {
    Object.entries(props.trajectories).forEach(([robotIdStr, path]) => {
      const robotId = Number(robotIdStr)
      // Use logic to get color based on Robot ID if possible, otherwise by index in map
      // Here we trust ID matches robots list which is safer
      // We need to map robotId to color index.
      const robotIndex = robots.findIndex((r) => r.id === robotId)
      // If robot not found (maybe left?), fallback to ID based modulo
      const colorIndex = robotIndex >= 0 ? robotIndex : robotId
      const color = getRobotColor(colorIndex)

      drawTrajectory(ctx, path, color)
    })
  } else if (props.trajectory && props.trajectory.length > 0) {
    // Legacy single trajectory
    drawTrajectory(ctx, props.trajectory, trajectoryColors.line)
  }

  // Draw robots
  robots.forEach((robot, index) => {
    const robotX = Math.floor(robot.x) * cellSize + cellSize / 2
    const robotY = Math.floor(robot.y) * cellSize + cellSize / 2
    const robotColor = getRobotColor(index)

    // Draw patrol range only for the first robot (or selected robot in future)
    if (index === 0) {
      drawPatrolRange(ctx, robotX, robotY, patrolRangeFillColor, patrolRangeStrokeColor)
    }

    // Robot body (circle)
    ctx.fillStyle = robotColor
    ctx.beginPath()
    ctx.arc(robotX, robotY, cellSize / 3, 0, Math.PI * 2)
    ctx.fill()

    // Robot border
    ctx.strokeStyle = robotBorderColor
    ctx.lineWidth = 3
    ctx.stroke()

    // Charging indicator
    if (robot.isCharging) {
      ctx.strokeStyle = '#E6A23C' // Warning Color (Yellow/Orange) for charging halo
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(robotX, robotY, cellSize / 2.5, 0, Math.PI * 2)
      ctx.stroke()
    }

    // Robot direction indicator (small circle)
    drawOrientationIndicator(ctx, robotX, robotY, robotDirectionColor, robot.orientation)

    // Robot ID badge
    if (robots.length > 1 && typeof robot.id === 'number') {
      ctx.fillStyle = '#fff'
      ctx.font = `bold ${cellSize / 4}px Arial`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(robot.id), robotX, robotY)
    }
  })

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
  // Yellow: 255, 255, 0 (Low threat) -> Red: 255, 0, 0 (High threat)
  // But standard heatmap is usually Blue -> Cyan -> Green -> Yellow -> Red
  // For security robot:
  // 0.0 (No threat) -> Transparent/Gray
  // 0.1 (Low) -> Yellow/Green
  // 1.0 (High) -> Red

  // Simple interpolation:
  // level 0: (255, 255, 255) or similar? No, stick to existing logic but improve it potentially
  // Existing logic: Green component decreases as level increases. Red stays 255.
  // This produces Yellow -> Orange -> Red.
  const red = Math.floor(255)
  const green = Math.floor(255 * (1 - level))
  const blue = 0

  return `rgb(${red}, ${green}, ${blue})`
}

/**
 * Draw robot trajectory (path history)
 */
const drawTrajectory = (ctx: CanvasRenderingContext2D, path: Position[], color: string | TrajectoryColors) => {
  if (!path || path.length === 0) return

  // Resolve colors
  let specificColors: TrajectoryColors
  if (typeof color === 'string') {
    // Default from root style if not provided (should be passed but fallback just in case)
    const rootStyle = getComputedStyle(document.documentElement)
    specificColors = {
      line: color,
      point: color,
      pointBorder: rootStyle.getPropertyValue('--color-trajectory-point-border').trim() || '#fff',
    }
  } else {
    specificColors = color
  }

  const { line: lineColor, point: pointColor, pointBorder } = specificColors

  // Make line color semi-transparent if it's a solid color string and not rgba
  // This logic from HEAD helps when single color string is passed
  const strokeStyle =
    typeof color === 'string' &&
    (lineColor.startsWith('#') || (lineColor.startsWith('rgb') && !lineColor.startsWith('rgba')))
      ? lineColor // We could add opacity here but let's rely on caller or inputs
      : lineColor

  // Check if we need to force some transparency for multi-agent overlapping lines (HEAD logic)
  ctx.globalAlpha = 0.6

  // Draw trajectory path
  ctx.strokeStyle = strokeStyle
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  ctx.beginPath()
  path.forEach((pos, index) => {
    const x = Math.floor(pos.x) * cellSize + cellSize / 2
    const y = Math.floor(pos.y) * cellSize + cellSize / 2

    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  ctx.stroke()

  ctx.globalAlpha = 1.0 // Reset alpha

  // Draw trajectory points (fade from old to recent) - GPU Optimization Feature
  path.forEach((pos, index) => {
    const x = Math.floor(pos.x) * cellSize + cellSize / 2
    const y = Math.floor(pos.y) * cellSize + cellSize / 2

    // Calculate opacity based on position in trajectory (older = more transparent)
    const opacity = 0.2 + (index / path.length) * 0.6

    ctx.save()
    ctx.globalAlpha = Math.min(1, Math.max(0, opacity))

    ctx.fillStyle = pointColor
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fill()

    // White border for visibility
    ctx.strokeStyle = pointBorder
    ctx.lineWidth = 1
    ctx.stroke()

    ctx.restore()
  })
}

const drawOrientationIndicator = (
  ctx: CanvasRenderingContext2D,
  robotX: number,
  robotY: number,
  color: string,
  orientationValue?: number | null
) => {
  const orientation = normalizeOrientation(orientationValue ?? props.robotOrientation)
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
    props.robots,
    props.robotPosition,
    props.robotOrientation,
    props.coverageMap,
    props.threatGrid,
    props.obstacles,
    // props.gridWidth, // Handled separately
    // props.gridHeight, // Handled separately
    props.trajectory,
    props.trajectories,
    props.patrolRadius,
    props.chargingStationPosition,
    props.chargingStations,
    props.chargingStationPosition,
    props.chargingStations,
    props.trajectories,
  ],
  () => {
    drawEnvironment()
  },
  { deep: true }
)

// Watch for grid dimension changes to refit view
watch(
  () => [props.gridWidth, props.gridHeight],
  () => {
    // Use timeout to allow canvas to resize
    setTimeout(() => {
      fitToView()
    }, 50)
  }
)

onMounted(() => {
  updateRobotColors()
  // Wait for DOM layout
  setTimeout(() => {
    fitToView()
  }, 100)
})
</script>

<template>
  <div class="environment-visualization">
    <div
      ref="canvasWrapper"
      class="environment-visualization__canvas-wrapper"
      :style="{ aspectRatio: `${gridWidth} / ${gridHeight}` }"
    >
      <canvas ref="canvas" :width="canvasWidth" :height="canvasHeight" class="environment-visualization__canvas" />
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
    background-color: var(--color-bg-canvas-wrapper, #f5f7fa);
    border: 1px solid var(--color-border-default);
    border-radius: 4px;
    display: flex;
    justify-content: center;
    overflow: hidden; /* Hide scrollbars for pan/zoom UI */
    position: relative;
  }

  &__canvas {
    background-color: var(--color-bg-canvas);
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 0.1);
    display: block;
    height: 100%; /* Ensure it scales to container */
    width: 100%; /* Ensure it scales to container */
  }

  &__legend {
    background-color: var(--color-bg-legend);
    border: 1px solid var(--color-border-default);
    border-radius: 8px;
    color: var(--color-text-legend);
    display: flex;
    flex-wrap: wrap; /* Allow wrapping */
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

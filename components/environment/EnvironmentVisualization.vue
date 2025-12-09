<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'

import { useCanvasRenderer, type EnvironmentRenderProps, type RobotRenderState } from '~/composables/useCanvasRenderer'
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
  visitHistoryMap?: number[][] // Cycle 11: Pheromone/Visit History Map
  obstacles?: boolean[][] | null // 障害物マップ
  trajectories?: Record<number, Position[]> // Multi-Agent Support: Dictionary of trajectories by robot ID
  trajectory?: Position[] // Legacy support for single robot
  patrolRadius?: number
  chargingStationPosition?: Position | null // Legacy support
  chargingStations?: Position[] // Multi-Agent Support: List of charging stations
  // Legacy props support might require strict handling if not used anymore, but keeping interface for safe refactoring
}

const props = withDefaults(defineProps<Props>(), {
  gridWidth: 8,
  gridHeight: 8,
  robotPosition: null,
  robots: () => [],
  coverageMap: () => [],
  threatGrid: () => [],
  visitHistoryMap: () => [],
  obstacles: null,
  trajectories: () => ({}),
  trajectory: () => [],
  robotOrientation: null,
  patrolRadius: DEFAULT_PATROL_RADIUS,
  chargingStationPosition: null,
  chargingStations: () => [],
})

const { drawEnvironment, cellSize } = useCanvasRenderer()

const canvas = ref<HTMLCanvasElement | null>(null)
// const cellSize = 60 // Already in composable

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

  render()
}

// Computed robots to draw
const robotsToDraw = computed<RobotRenderState[]>(() => {
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

const normalizeChargingStations = computed<Position[]>(() => {
  if (props.chargingStations && props.chargingStations.length > 0) {
    return props.chargingStations
  }
  if (props.chargingStationPosition) {
    return [props.chargingStationPosition]
  }
  return []
})

const normalizeTrajectories = computed<Record<number, Position[]>>(() => {
  if (props.trajectories && Object.keys(props.trajectories).length > 0) {
    return props.trajectories
  }
  if (props.trajectory && props.trajectory.length > 0) {
    // Treat legacy trajectory as robot ID 0 (or default)
    // To match robot coloring logic which uses index/ID, we should probably associate it with the single robot
    // The previous logic passed single trajectory with a specific color.
    // The composable expects Record<number, Position[]> and colors based on ID/index.
    // If we pass key '0', it matches robot ID 0.
    return { 0: props.trajectory }
  }
  return {}
})

const render = () => {
  if (!canvas.value) return

  const renderData: EnvironmentRenderProps = {
    gridWidth: props.gridWidth,
    gridHeight: props.gridHeight,
    robots: robotsToDraw.value,
    coverageMap: props.coverageMap,
    threatGrid: props.threatGrid,
    visitHistoryMap: props.visitHistoryMap,
    obstacles: props.obstacles,
    trajectories: normalizeTrajectories.value,
    patrolRadius: props.patrolRadius,
    chargingStations: normalizeChargingStations.value,
  }

  const transform = {
    offsetX: offsetX.value,
    offsetY: offsetY.value,
    scale: scale.value,
  }

  drawEnvironment(canvas.value, renderData, transform)
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
  ],
  () => {
    render()
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
  // updateRobotColors() is no longer needed here as colors are handled in composable or defaults
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

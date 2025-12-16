<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'

import BatteryDisplay from '~/components/environment/BatteryDisplay.vue'
import EnvironmentVisualization from '~/components/environment/EnvironmentVisualization.vue'
import RobotPositionDisplay from '~/components/environment/RobotPositionDisplay.vue'
import TrainingMetrics from '~/components/training/TrainingMetrics.vue'
import { DEFAULT_PATROL_RADIUS } from '~/configs/constants'
import type { Position } from '~/libs/domains/common/Position'
import type { RobotState } from '~/libs/domains/environment/RobotState'
import type { TrainingSession } from '~/libs/domains/training/TrainingSession'
import { TrainingSessionEntity } from '~/libs/entities/training/TrainingSessionEntity'
import type {
  TrainingProgressMessage,
  TrainingStatusMessage,
  ConnectionAckMessage,
  TrainingErrorMessage,
  EnvironmentUpdateMessage,
  PaginatedMetricsResponse,
  TrainingMetricDTO,
} from '~/types/api'
import { getChargingStationPosition } from '~/utils/batteryHelpers'
import { updateRobotsFromMessage } from '~/utils/robotStateHelpers'

const route = useRoute()
const sessionId = computed(() => Number(route.params.sessionId))
const config = useRuntimeConfig()

// Session info state
const sessionInfo = ref<TrainingSession | null>(null)
const sessionLoading = ref(true)
const sessionError = ref<string | null>(null)
const sessionStartTime = ref<Date | null>(null)

// WebSocket integration
const { connect, disconnect, isConnected, error, on, off } = useWebSocket()

// Real-time metrics
const currentMetrics = ref({
  timestep: 0,
  episode: 0,
  reward: 0,
  loss: null as number | null,
  coverageRatio: null as number | null,
  explorationScore: null as number | null,
  threatLevelAvg: null as number | null,
})

// Historical metrics
const metricsHistory = ref<TrainingMetricDTO[]>([])
const metricsError = ref<string>('')

// Training status and notifications
const trainingStatus = ref<string>('')
const statusMessage = ref<string>('')
const statusType = ref<'success' | 'info' | 'warning' | 'error'>('info')
const showStatusAlert = ref(false)

// Environment update state
const robots = ref<RobotState[]>([])
// Multi-agent trajectory support
const robotTrajectories = ref<Record<number, Position[]>>({})
// Legacy trajectory support
const robotTrajectory = ref<Position[]>([])

const lastAction = ref<string>('')
const lastReward = ref<number>(0)
const gridWidth = ref<number>(8)
const gridHeight = ref<number>(8)
const coverageMap = ref<boolean[][]>([])
const threatGrid = ref<number[][]>([])
const patrolRadius = ref<number>(DEFAULT_PATROL_RADIUS)

// Battery system state (Session 050)
const globalBatteryPercentage = ref<number | null>(null)
const globalIsCharging = ref<boolean>(false)
const distanceToStation = ref<number | null>(null)
// Charging stations (Multi & Single)
const chargingStations = ref<Position[]>([])
const chargingStationPosition = ref<Position | null>(null)

// Computed properties for robot state (Reactivity Optimization)
const firstRobot = computed(() => (robots.value.length > 0 ? robots.value[0] : null))

const robotPosition = computed(() => {
  if (firstRobot.value) {
    return { x: firstRobot.value.x, y: firstRobot.value.y }
  }
  return null
})

const robotOrientation = computed(() => firstRobot.value?.orientation ?? null)

const batteryPercentage = computed(() => {
  if (firstRobot.value) return firstRobot.value.batteryPercentage
  return globalBatteryPercentage.value
})

const isCharging = computed(() => {
  if (firstRobot.value) return firstRobot.value.isCharging
  return globalIsCharging.value
})

// Computed property for RobotPositionDisplay (converts x,y to row,col)
const robotPositionForDisplay = computed(() => {
  if (!robotPosition.value) return null
  return {
    row: Math.round(robotPosition.value.y),
    col: Math.round(robotPosition.value.x),
  }
})

// Session info computed properties
const totalTimesteps = computed(() => sessionInfo.value?.totalTimesteps ?? 0)
const numRobots = computed(() => sessionInfo.value?.numRobots ?? 1)
const progressPercentage = computed(() => {
  if (totalTimesteps.value === 0) return 0
  return Math.min(100, (currentMetrics.value.timestep / totalTimesteps.value) * 100)
})
const estimatedTimeRemaining = computed(() => {
  if (!sessionStartTime.value || !sessionInfo.value?.isRunning) return null
  if (currentMetrics.value.timestep === 0 || progressPercentage.value === 0) return null

  const elapsed = Date.now() - sessionStartTime.value.getTime()
  const stepsPerMs = currentMetrics.value.timestep / elapsed
  const remainingSteps = totalTimesteps.value - currentMetrics.value.timestep
  const remainingMs = remainingSteps / stepsPerMs

  return Math.ceil(remainingMs / 60000) // Convert to minutes
})

/**
 * Calculate Manhattan distance from a robot to the nearest charging station.
 */
const calculateDistanceToStation = (robot: RobotState): number | null => {
  // If robot has explicit distance (legacy), use it? No, legacy is global.
  // Calculate from positions
  if (!chargingStations.value || chargingStations.value.length === 0) {
    // Fallback to legacy single station if available
    if (chargingStationPosition.value) {
      return (
        Math.abs(Math.round(robot.x) - Math.round(chargingStationPosition.value.x)) +
        Math.abs(Math.round(robot.y) - Math.round(chargingStationPosition.value.y))
      )
    }
    return null
  }

  let minDist = Infinity
  for (const station of chargingStations.value) {
    const dist =
      Math.abs(Math.round(robot.x) - Math.round(station.x)) + Math.abs(Math.round(robot.y) - Math.round(station.y))
    if (dist < minDist) {
      minDist = dist
    }
  }
  return minDist === Infinity ? null : minDist
}

// Type guards for 2D arrays
const isNumberArray2D = (value: unknown): value is number[][] => {
  if (!Array.isArray(value)) return false
  return value.every((row) => Array.isArray(row) && row.every((cell) => typeof cell === 'number'))
}

// Type guard functions for WebSocket messages
const isTrainingProgressMessage = (msg: unknown): msg is TrainingProgressMessage => {
  if (!msg || typeof msg !== 'object') return false
  const m = msg as Record<string, unknown>

  return (
    typeof m.type === 'string' &&
    m.type === 'training_progress' &&
    typeof m.session_id === 'number' &&
    typeof m.timestep === 'number' &&
    typeof m.reward === 'number' &&
    // Optional properties
    (m.episode === undefined || m.episode === null || typeof m.episode === 'number') &&
    (m.loss === undefined || m.loss === null || typeof m.loss === 'number') &&
    (m.coverage_ratio === undefined || m.coverage_ratio === null || typeof m.coverage_ratio === 'number') &&
    (m.exploration_score === undefined || m.exploration_score === null || typeof m.exploration_score === 'number') &&
    (m.threat_level_avg === undefined || m.threat_level_avg === null || typeof m.threat_level_avg === 'number') &&
    (m.additional_metrics === undefined || typeof m.additional_metrics === 'object') &&
    (m.data === undefined || (typeof m.data === 'object' && m.data !== null))
  )
}

const isTrainingStatusMessage = (msg: unknown): msg is TrainingStatusMessage => {
  if (!msg || typeof msg !== 'object') return false
  const m = msg as Record<string, unknown>

  return (
    typeof m.type === 'string' &&
    m.type === 'training_status' &&
    typeof m.session_id === 'number' &&
    typeof m.status === 'string' &&
    // Optional message property
    (m.message === undefined || m.message === null || typeof m.message === 'string')
  )
}

const isConnectionAckMessage = (msg: unknown): msg is ConnectionAckMessage => {
  if (!msg || typeof msg !== 'object') return false
  const m = msg as Record<string, unknown>

  return (
    typeof m.type === 'string' &&
    m.type === 'connection_ack' &&
    typeof m.client_id === 'string' &&
    // Optional message property
    (m.message === undefined || typeof m.message === 'string')
  )
}

const isTrainingErrorMessage = (msg: unknown): msg is TrainingErrorMessage => {
  if (!msg || typeof msg !== 'object') return false
  const m = msg as Record<string, unknown>

  return (
    typeof m.type === 'string' &&
    m.type === 'training_error' &&
    typeof m.session_id === 'number' &&
    typeof m.error_message === 'string' &&
    // Optional properties
    (m.message === undefined || typeof m.message === 'string') &&
    (m.error_type === undefined || m.error_type === null || typeof m.error_type === 'string')
  )
}

const isEnvironmentUpdateMessage = (msg: unknown): msg is EnvironmentUpdateMessage => {
  if (!msg || typeof msg !== 'object') return false
  const m = msg as Record<string, unknown>

  // Validate robot_position (can be object or array)
  const hasValidRobotPosition = Boolean(
    m.robot_position &&
      typeof m.robot_position === 'object' &&
      ((Array.isArray(m.robot_position) && m.robot_position.length === 2) ||
        (!Array.isArray(m.robot_position) && 'x' in m.robot_position && 'y' in m.robot_position))
  )

  // Validate robots array
  const hasValidRobots =
    Array.isArray(m.robots) &&
    m.robots.every((r) => {
      if (typeof r !== 'object' || r === null) return false
      const robot = r as Record<string, unknown>
      return (
        typeof robot.id === 'number' &&
        typeof robot.x === 'number' &&
        typeof robot.y === 'number' &&
        typeof robot.orientation === 'number' &&
        typeof robot.battery_percentage === 'number' &&
        typeof robot.is_charging === 'boolean'
      )
    })

  return (
    typeof m.type === 'string' &&
    m.type === 'environment_update' &&
    typeof m.session_id === 'number' &&
    typeof m.episode === 'number' &&
    typeof m.step === 'number' &&
    (hasValidRobotPosition || hasValidRobots) &&
    // Optional properties
    (m.action_taken === undefined || m.action_taken === null || typeof m.action_taken === 'number') &&
    (m.reward_received === undefined || m.reward_received === null || typeof m.reward_received === 'number') &&
    (m.grid_width === undefined || typeof m.grid_width === 'number') &&
    (m.grid_height === undefined || typeof m.grid_height === 'number') &&
    (m.coverage_map === undefined || isNumberArray2D(m.coverage_map)) &&
    (m.threat_grid === undefined || isNumberArray2D(m.threat_grid)) &&
    (m.robot_orientation === undefined || m.robot_orientation === null || typeof m.robot_orientation === 'number')
  )
}

// WebSocket message handlers

const handleTrainingProgress = (message: Record<string, unknown>) => {
  if (!isTrainingProgressMessage(message)) return

  if (message.session_id === sessionId.value) {
    // Extract threat_level_avg from additional_metrics or direct field
    let threatLevel = message.data?.threat_level_avg ?? message.threat_level_avg ?? null

    if (threatLevel === null && message.additional_metrics) {
      const am = message.additional_metrics as Record<string, unknown>
      if (typeof am.threat_level_avg === 'number') {
        threatLevel = am.threat_level_avg
      }
    }

    currentMetrics.value = {
      timestep: message.data?.timestep || message.timestep || 0,
      episode: message.data?.episode || message.episode || 0,
      reward: message.data?.reward || message.reward || 0,
      loss: message.data?.loss ?? message.loss ?? null,
      coverageRatio: message.data?.coverage_ratio ?? message.coverage_ratio ?? null,
      explorationScore: message.data?.exploration_score ?? message.exploration_score ?? null,
      threatLevelAvg: threatLevel,
    }
  }
}

const handleTrainingStatus = (message: Record<string, unknown>) => {
  if (!isTrainingStatusMessage(message)) return

  if (message.session_id === sessionId.value) {
    trainingStatus.value = message.status || ''
    statusMessage.value = message.message || ''

    // Determine alert type based on status
    if (message.status === 'running' || message.status === 'started') {
      statusType.value = 'success'
    } else if (message.status === 'completed') {
      statusType.value = 'success'
    } else if (message.status === 'paused') {
      statusType.value = 'warning'
    } else if (message.status === 'failed' || message.status === 'error') {
      statusType.value = 'error'
    } else {
      statusType.value = 'info'
    }

    showStatusAlert.value = true

    // Auto-hide after 5 seconds (except for errors)
    if (statusType.value !== 'error') {
      setTimeout(() => {
        showStatusAlert.value = false
      }, 5000)
    }
  }
}

const handleConnectionAck = (message: Record<string, unknown>) => {
  if (!isConnectionAckMessage(message)) return

  console.log('WebSocket connected, client_id:', message.client_id)
}

const handlePong = () => {
  console.log('Pong received')
}

const handleTrainingError = (message: Record<string, unknown>) => {
  if (!isTrainingErrorMessage(message)) return

  if (message.session_id === sessionId.value) {
    const errorMsg = message.error_message || message.message || 'Unknown error occurred'
    const errorType = message.error_type || 'unknown'

    trainingStatus.value = 'error'
    statusMessage.value = `Error (${errorType}): ${errorMsg}`
    statusType.value = 'error'
    showStatusAlert.value = true
  }
}

const handleEnvironmentUpdate = (message: Record<string, unknown>) => {
  if (!isEnvironmentUpdateMessage(message)) return

  if (message.session_id === sessionId.value) {
    // Update robots state
    robots.value = updateRobotsFromMessage(message)

    // Update trajectories for all robots
    robots.value.forEach((robot) => {
      const robotId = robot.id ?? 0
      const newPos = { x: robot.x, y: robot.y }

      if (!robotTrajectories.value[robotId]) {
        robotTrajectories.value[robotId] = []
      }

      const traj = robotTrajectories.value[robotId]
      const lastPoint = traj.length > 0 ? traj[traj.length - 1] : undefined

      if (!lastPoint || lastPoint.x !== newPos.x || lastPoint.y !== newPos.y) {
        traj.push(newPos)
        // Limit trajectory length
        if (traj.length > 100) {
          traj.shift()
        }
      }
    })

    // Legacy trajectory support (for first robot)
    if (robots.value.length > 0) {
      const r = robots.value[0]!
      robotTrajectory.value = [...(robotTrajectories.value[r.id ?? 0] || [])]
    }

    // Update action and reward
    lastAction.value = String(message.action_taken || '')
    lastReward.value = typeof message.reward_received === 'number' ? message.reward_received : 0

    // Update grid dimensions if provided
    if (typeof message.grid_width === 'number') gridWidth.value = message.grid_width
    if (typeof message.grid_height === 'number') gridHeight.value = message.grid_height

    // Update coverage map if provided (convert number[][] to boolean[][])
    if (Array.isArray(message.coverage_map)) {
      coverageMap.value = message.coverage_map.map((row) => row.map((cell) => cell !== 0))
    }

    // Update threat grid if provided
    if (Array.isArray(message.threat_grid)) {
      threatGrid.value = message.threat_grid
      // Auto-update grid dimensions from threat grid if valid
      if (threatGrid.value.length > 0) {
        gridHeight.value = threatGrid.value.length
        const firstRow = threatGrid.value[0]
        if (firstRow && firstRow.length > 0) {
          gridWidth.value = firstRow.length
        }
      }
    }

    // Update charging stations (Multi-agent)
    if (Array.isArray(message.charging_stations)) {
      chargingStations.value = (message.charging_stations as Array<{ x: number; y: number }>).map((cs) => ({
        x: cs.x,
        y: cs.y,
      }))
    }

    // Update battery information (Session 050) - Legacy fallback
    if (typeof message.battery_percentage === 'number' && robots.value.length === 0) {
      globalBatteryPercentage.value = message.battery_percentage
    }
    if (typeof message.is_charging === 'boolean' && robots.value.length === 0) {
      globalIsCharging.value = message.is_charging
    }
    if (typeof message.distance_to_charging_station === 'number') {
      distanceToStation.value = message.distance_to_charging_station
    }
    const stationPosition = getChargingStationPosition(message)
    if (stationPosition) {
      chargingStationPosition.value = stationPosition
    }
  }
}

const fetchMetricsHistory = async () => {
  try {
    const url = `${config.public.apiBaseUrl}/api/v1/training/sessions/${sessionId.value}/metrics`
    console.log('Fetching metrics from:', url)
    const data = await $fetch<PaginatedMetricsResponse>(url, {
      query: { page: 1, page_size: 500 },
    })
    if (data) {
      console.log('Metrics fetched:', data.metrics.length)
      metricsHistory.value = data.metrics
    }
  } catch (e: any) {
    console.error('Failed to fetch metrics history', e)
    metricsError.value = e.message || String(e)
  }
}

onMounted(async () => {
  const id = sessionId.value
  if (id && !isNaN(id)) {
    sessionLoading.value = true

    try {
      // Fetch session info from backend API
      const { data, error: fetchError } = await useAsyncData(`session-${id}`, () =>
        $fetch(`${config.public.apiBaseUrl}/api/v1/training/${id}/status`)
      )

      if (fetchError.value) {
        sessionError.value = `Failed to load session info: ${fetchError.value.message || fetchError.value}`
        ElMessage.error(sessionError.value)
      } else if (data.value) {
        // Convert DTO to domain model using entity
        sessionInfo.value = TrainingSessionEntity.toDomain(data.value as any)
        if (sessionInfo.value.startedAt) {
          sessionStartTime.value = sessionInfo.value.startedAt
        }

        // Fetch metrics history
        await fetchMetricsHistory()

        // Initialize currentMetrics from history if available
        if (metricsHistory.value.length > 0) {
          const latestMetric = metricsHistory.value[0]
          if (latestMetric) {
            interface AdditionalMetrics {
              threat_level_avg?: number
            }
            const am = latestMetric.additional_metrics as AdditionalMetrics | null
            const threatLevel = am?.threat_level_avg ?? null

            currentMetrics.value = {
              timestep: latestMetric.timestep,
              episode: latestMetric.episode ?? 0,
              reward: latestMetric.reward,
              loss: latestMetric.loss,
              coverageRatio: latestMetric.coverage_ratio,
              explorationScore: latestMetric.exploration_score,
              threatLevelAvg: threatLevel,
            }
          }
        } else if (sessionInfo.value.status === 'completed') {
          // Fallback for completed sessions without metrics (e.g. legacy)
          currentMetrics.value = {
            timestep: sessionInfo.value.totalTimesteps,
            episode: sessionInfo.value.episodesCompleted,
            reward: 0,
            loss: null,
            coverageRatio: null,
            explorationScore: null,
            threatLevelAvg: null,
          }
        }

        // Register message handlers
        on('training_progress', handleTrainingProgress)
        on('training_status', handleTrainingStatus)
        on('training_error', handleTrainingError)
        on('environment_update', handleEnvironmentUpdate)
        on('connection_ack', handleConnectionAck)
        on('pong', handlePong)

        // Connect to WebSocket
        connect(id)
      }
    } finally {
      sessionLoading.value = false
    }
  } else {
    console.error('Invalid session ID, WebSocket connection aborted.', id)
    sessionLoading.value = false
  }
})

onBeforeUnmount(() => {
  // Cleanup
  off('training_progress')
  off('training_status')
  off('training_error')
  off('environment_update')
  off('connection_ack')
  off('pong')
  disconnect()
})
</script>

<template>
  <div class="training-session">
    <div class="training-session__header">
      <h2>Training Session {{ sessionId }}</h2>
      <el-tag :type="isConnected ? 'success' : 'info'">
        {{ isConnected ? 'WebSocket Connected' : 'Disconnected' }}
      </el-tag>
    </div>

    <el-alert v-if="error" type="error" :closable="false" show-icon>
      {{ error }}
    </el-alert>

    <el-alert
      v-if="showStatusAlert"
      :type="statusType"
      :closable="true"
      show-icon
      style="margin-bottom: 20px"
      @close="showStatusAlert = false"
    >
      <template #title> Training Status: {{ trainingStatus }} </template>
      {{ statusMessage }}
    </el-alert>

    <!-- Session Info Card -->
    <el-card v-if="sessionInfo" class="training-session__session-info" style="margin-bottom: 20px">
      <template #header>
        <span class="training-session__session-info-title">セッション情報</span>
      </template>
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="training-session__info-card">
            <div class="training-session__info-label">ロボット数</div>
            <div class="training-session__info-value">{{ numRobots }}台</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="training-session__info-card">
            <div class="training-session__info-label">目標ステップ数</div>
            <div class="training-session__info-value">{{ totalTimesteps.toLocaleString() }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="training-session__info-card">
            <div class="training-session__info-label">進捗率</div>
            <div class="training-session__info-value">{{ progressPercentage.toFixed(1) }}%</div>
            <el-progress :percentage="progressPercentage" :stroke-width="8" style="margin-top: 8px" />
          </div>
        </el-col>
        <el-col :span="6">
          <div class="training-session__info-card">
            <div class="training-session__info-label">完了予測</div>
            <div class="training-session__info-value">
              {{ estimatedTimeRemaining !== null ? `約${estimatedTimeRemaining}分後` : 'N/A' }}
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="training-session__metrics">
      <template #header>
        <span class="training-session__metrics-title">Real-time Metrics</span>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="Timestep">
          <div class="training-session__metrics-value">{{ currentMetrics.timestep }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="Episode">
          <div class="training-session__metrics-value">{{ currentMetrics.episode }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="Reward">
          <div class="training-session__metrics-value">{{ currentMetrics.reward.toFixed(2) }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="Loss">
          <div class="training-session__metrics-value">
            {{ currentMetrics.loss !== null ? currentMetrics.loss.toFixed(4) : 'N/A' }}
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-row v-if="robotPosition" :gutter="20" style="margin-bottom: 20px">
      <el-col :span="16">
        <el-card class="training-session__environment">
          <template #header>
            <span>Environment Visualization</span>
          </template>
          <EnvironmentVisualization
            :grid-width="gridWidth"
            :grid-height="gridHeight"
            :robot-position="robotPosition"
            :robot-orientation="robotOrientation"
            :robots="robots"
            :coverage-map="coverageMap"
            :threat-grid="threatGrid"
            :trajectories="robotTrajectories"
            :patrol-radius="patrolRadius"
            :charging-station-position="chargingStationPosition"
            :charging-stations="chargingStations"
          />
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="training-session__environment-info">
          <template #header>
            <span>Environment State</span>
          </template>

          <!-- Multi-robot display -->
          <div v-if="robots.length > 0" class="robots-list">
            <div v-for="(robot, index) in robots" :key="index" class="robot-item">
              <h4>Robot {{ robot.id ?? index }}</h4>
              <RobotPositionDisplay
                :position="{ row: Math.round(robot.y), col: Math.round(robot.x) }"
                :orientation="robot.orientation"
              />
              <BatteryDisplay
                :battery-percentage="robot.batteryPercentage"
                :is-charging="robot.isCharging"
                :distance-to-station="calculateDistanceToStation(robot)"
                style="margin-top: 10px"
              />
              <el-divider v-if="index < robots.length - 1" />
            </div>
          </div>

          <!-- Legacy fallback -->
          <div v-else>
            <RobotPositionDisplay
              v-if="robotPositionForDisplay"
              :position="robotPositionForDisplay"
              :orientation="robotOrientation"
            />
            <BatteryDisplay
              :battery-percentage="batteryPercentage"
              :is-charging="isCharging"
              :distance-to-station="distanceToStation"
              style="margin-top: 15px"
            />
          </div>

          <el-descriptions :column="2" border style="margin-top: 15px">
            <el-descriptions-item label="Last Action">
              {{ lastAction || 'N/A' }}
            </el-descriptions-item>
            <el-descriptions-item label="Last Reward">
              {{ lastReward.toFixed(4) }}
            </el-descriptions-item>
            <el-descriptions-item label="警備半径 (セル)">
              {{ patrolRadius }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <TrainingMetrics :realtime-metrics="currentMetrics" :metrics-history="metricsHistory" />
  </div>
</template>

<style lang="scss" scoped>
.training-session {
  padding: 20px;

  &__header {
    align-items: center;
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;

    h2 {
      color: var(--md-on-background);
      font-size: 1.75rem;
      font-weight: 600;
      margin: 0;
    }
  }

  &__metrics-value {
    color: var(--color-text-primary);
  }

  &__metrics {
    background-color: var(--md-surface-1);
    border: 1px solid var(--md-outline-variant);
    margin-bottom: 20px;
  }

  &__environment {
    background: linear-gradient(135deg, var(--md-primary-container) 0%, var(--md-surface) 100%);
    border: 2px solid var(--md-primary);
    border-radius: 12px;
    height: auto;
    min-height: 400px;
    padding: 20px;

    /* Aspect ratio handled by wrapper inside component */

    canvas {
      height: 100%;
      width: 100%;
    }
  }

  &__environment-info {
    background: linear-gradient(135deg, var(--md-tertiary-container) 0%, var(--md-surface) 100%);
    border: 2px solid var(--md-tertiary);
    border-radius: 12px;
    height: auto;
    max-height: 80vh;
    min-height: 400px;
    overflow-y: auto;
    padding: 20px;
  }

  &__session-info {
    background-color: var(--md-surface-1);
    border: 1px solid var(--md-outline-variant);
  }

  &__session-info-title {
    color: var(--md-on-surface);
    font-size: 1.1rem;
    font-weight: 600;
  }

  &__info-card {
    background: linear-gradient(135deg, var(--md-secondary-container) 0%, var(--md-surface) 100%);
    border: 1px solid var(--md-secondary);
    border-radius: 8px;
    padding: 16px;
    text-align: center;
  }

  &__info-label {
    color: var(--md-on-secondary-container);
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 8px;
  }

  &__info-value {
    color: var(--md-on-surface);
    font-size: 1.5rem;
    font-weight: 700;
  }
}

.robots-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.robot-item {
  h4 {
    color: var(--color-text-primary);
    margin: 0 0 10px;
  }
}
</style>

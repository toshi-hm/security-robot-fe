<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'

import EnvironmentVisualization from '~/components/environment/EnvironmentVisualization.vue'
import RobotPositionDisplay from '~/components/environment/RobotPositionDisplay.vue'
import TrainingMetrics from '~/components/training/TrainingMetrics.vue'
import { DEFAULT_PATROL_RADIUS } from '~/configs/constants'
import type {
  TrainingProgressMessage,
  TrainingStatusMessage,
  ConnectionAckMessage,
  TrainingErrorMessage,
  EnvironmentUpdateMessage,
} from '~/types/api'

const route = useRoute()
const sessionId = computed(() => Number(route.params.sessionId))

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
})

// Training status and notifications
const trainingStatus = ref<string>('')
const statusMessage = ref<string>('')
const statusType = ref<'success' | 'info' | 'warning' | 'error'>('info')
const showStatusAlert = ref(false)

// Environment update state
const robotPosition = ref<{ x: number; y: number } | null>(null)
const robotOrientation = ref<number | null>(null)
const robotTrajectory = ref<Array<{ x: number; y: number }>>([])
const lastAction = ref<string>('')
const lastReward = ref<number>(0)
const gridWidth = ref<number>(8)
const gridHeight = ref<number>(8)
const coverageMap = ref<boolean[][]>([])
const threatGrid = ref<number[][]>([])
const patrolRadius = ref<number>(DEFAULT_PATROL_RADIUS)

// Computed property for RobotPositionDisplay (converts x,y to row,col)
const robotPositionForDisplay = computed(() => {
  if (!robotPosition.value) return null
  return {
    row: Math.round(robotPosition.value.y),
    col: Math.round(robotPosition.value.x),
  }
})

const orientationLabels = ['北', '東', '南', '西'] as const
const robotOrientationText = computed(() => {
  if (robotOrientation.value === null || Number.isNaN(robotOrientation.value)) return '未取得'
  const normalized = ((Math.round(robotOrientation.value) % orientationLabels.length) + orientationLabels.length) % orientationLabels.length
  return orientationLabels[normalized]
})

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

  return (
    typeof m.type === 'string' &&
    m.type === 'environment_update' &&
    typeof m.session_id === 'number' &&
    typeof m.episode === 'number' &&
    typeof m.step === 'number' &&
    hasValidRobotPosition &&
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
    currentMetrics.value = {
      timestep: message.data?.timestep || message.timestep || 0,
      episode: message.data?.episode || message.episode || 0,
      reward: message.data?.reward || message.reward || 0,
      loss: message.data?.loss ?? message.loss ?? null,
      coverageRatio: message.data?.coverage_ratio ?? message.coverage_ratio ?? null,
      explorationScore: message.data?.exploration_score ?? message.exploration_score ?? null,
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
    // Update robot position
    if (message.robot_position) {
      const robotPos = Array.isArray(message.robot_position)
        ? { x: message.robot_position[0] ?? 0, y: message.robot_position[1] ?? 0 }
        : message.robot_position
      const newPosition = {
        x: robotPos.x ?? 0,
        y: robotPos.y ?? 0,
      }
      const orientationFromPayload =
        (!Array.isArray(message.robot_position) && typeof robotPos.orientation === 'number' ? robotPos.orientation : null) ??
        (typeof message.robot_orientation === 'number' ? message.robot_orientation : null)

      // Add to trajectory if position changed
      if (!robotPosition.value || robotPosition.value.x !== newPosition.x || robotPosition.value.y !== newPosition.y) {
        robotTrajectory.value.push({ ...newPosition })

        // Limit trajectory length to 100 points for performance
        if (robotTrajectory.value.length > 100) {
          robotTrajectory.value.shift()
        }
      }

      robotPosition.value = newPosition
      if (orientationFromPayload !== null) {
        robotOrientation.value = orientationFromPayload
      }
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
    }
  }
}

onMounted(() => {
  const id = sessionId.value
  if (id && !isNaN(id)) {
    // Register message handlers
    on('training_progress', handleTrainingProgress)
    on('training_status', handleTrainingStatus)
    on('training_error', handleTrainingError)
    on('environment_update', handleEnvironmentUpdate)
    on('connection_ack', handleConnectionAck)
    on('pong', handlePong)

    // Connect to WebSocket
    connect(id)
  } else {
    console.error('Invalid session ID, WebSocket connection aborted.', id)
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

    <el-card class="training-session__metrics">
      <template #header>
        <span>Real-time Metrics</span>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="Timestep">
          {{ currentMetrics.timestep }}
        </el-descriptions-item>
        <el-descriptions-item label="Episode">
          {{ currentMetrics.episode }}
        </el-descriptions-item>
        <el-descriptions-item label="Reward">
          {{ currentMetrics.reward.toFixed(2) }}
        </el-descriptions-item>
        <el-descriptions-item label="Loss">
          {{ currentMetrics.loss !== null ? currentMetrics.loss.toFixed(4) : 'N/A' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-row v-if="robotPosition" :gutter="20" style="margin-bottom: 20px">
      <el-col :span="12">
        <el-card class="training-session__environment">
          <template #header>
            <span>Environment Visualization</span>
          </template>
          <EnvironmentVisualization
            :grid-width="gridWidth"
            :grid-height="gridHeight"
            :robot-position="robotPosition"
            :robot-orientation="robotOrientation"
            :coverage-map="coverageMap"
            :threat-grid="threatGrid"
            :trajectory="robotTrajectory"
            :patrol-radius="patrolRadius"
          />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="training-session__environment-info">
          <template #header>
            <span>Environment State</span>
          </template>
          <RobotPositionDisplay
            v-if="robotPositionForDisplay"
            :position="robotPositionForDisplay"
            :orientation="robotOrientation"
          />
          <el-descriptions :column="2" border style="margin-top: 15px">
            <el-descriptions-item label="Position X">
              {{ robotPosition.x.toFixed(2) }}
            </el-descriptions-item>
            <el-descriptions-item label="Position Y">
              {{ robotPosition.y.toFixed(2) }}
            </el-descriptions-item>
            <el-descriptions-item label="Orientation">
              {{ robotOrientationText }}
            </el-descriptions-item>
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

    <TrainingMetrics :realtime-metrics="currentMetrics" />
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

  &__metrics {
    background-color: var(--md-surface-1);
    border: 1px solid var(--md-outline-variant);
    margin-bottom: 20px;
  }

  &__environment {
    background: linear-gradient(135deg, var(--md-primary-container) 0%, var(--md-surface) 100%);
    border: 2px solid var(--md-primary);
    height: 400px;

    canvas {
      height: 100%;
      width: 100%;
    }
  }

  &__environment-info {
    background: linear-gradient(135deg, var(--md-tertiary-container) 0%, var(--md-surface) 100%);
    border: 2px solid var(--md-tertiary);
    height: 400px;
  }
}
</style>

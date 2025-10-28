<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'

import EnvironmentVisualization from '~/components/environment/EnvironmentVisualization.vue'
import RobotPositionDisplay from '~/components/environment/RobotPositionDisplay.vue'
import TrainingMetrics from '~/components/training/TrainingMetrics.vue'
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
const robotTrajectory = ref<Array<{ x: number; y: number }>>([])
const lastAction = ref<string>('')
const lastReward = ref<number>(0)
const gridWidth = ref<number>(8)
const gridHeight = ref<number>(8)
const coverageMap = ref<boolean[][]>([])
const threatGrid = ref<number[][]>([])

// Computed property for RobotPositionDisplay (converts x,y to row,col)
const robotPositionForDisplay = computed(() => {
  if (!robotPosition.value) return null
  return {
    row: Math.round(robotPosition.value.y),
    col: Math.round(robotPosition.value.x),
  }
})

// WebSocket message handlers

const handleTrainingProgress = (message: Record<string, unknown>) => {
  const msg = message as unknown as TrainingProgressMessage
  if (msg.session_id === sessionId.value) {
    currentMetrics.value = {
      timestep: msg.data?.timestep || msg.timestep || 0,
      episode: msg.data?.episode || msg.episode || 0,
      reward: msg.data?.reward || msg.reward || 0,
      loss: msg.data?.loss ?? msg.loss ?? null,
      coverageRatio: msg.data?.coverage_ratio ?? msg.coverage_ratio ?? null,
      explorationScore: msg.data?.exploration_score ?? msg.exploration_score ?? null,
    }
  }
}

const handleTrainingStatus = (message: Record<string, unknown>) => {
  const msg = message as unknown as TrainingStatusMessage
  if (msg.session_id === sessionId.value) {
    trainingStatus.value = msg.status || ''
    statusMessage.value = msg.message || ''

    // Determine alert type based on status
    if (msg.status === 'running' || msg.status === 'started') {
      statusType.value = 'success'
    } else if (msg.status === 'completed') {
      statusType.value = 'success'
    } else if (msg.status === 'paused') {
      statusType.value = 'warning'
    } else if (msg.status === 'failed' || msg.status === 'error') {
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
  const msg = message as unknown as ConnectionAckMessage
  console.log('WebSocket connected, client_id:', msg.client_id)
}

const handlePong = () => {
  console.log('Pong received')
}

const handleTrainingError = (message: Record<string, unknown>) => {
  const msg = message as unknown as TrainingErrorMessage
  if (msg.session_id === sessionId.value) {
    const errorMsg = msg.error_message || msg.message || 'Unknown error occurred'
    const errorType = msg.error_type || 'unknown'

    trainingStatus.value = 'error'
    statusMessage.value = `Error (${errorType}): ${errorMsg}`
    statusType.value = 'error'
    showStatusAlert.value = true
  }
}

const handleEnvironmentUpdate = (message: Record<string, unknown>) => {
  const msg = message as unknown as EnvironmentUpdateMessage
  if (msg.session_id === sessionId.value) {
    // Update robot position
    if (msg.robot_position) {
      const robotPos = Array.isArray(msg.robot_position)
        ? { x: msg.robot_position[0] ?? 0, y: msg.robot_position[1] ?? 0 }
        : msg.robot_position
      const newPosition = {
        x: robotPos.x ?? 0,
        y: robotPos.y ?? 0,
      }

      // Add to trajectory if position changed
      if (!robotPosition.value || robotPosition.value.x !== newPosition.x || robotPosition.value.y !== newPosition.y) {
        robotTrajectory.value.push({ ...newPosition })

        // Limit trajectory length to 100 points for performance
        if (robotTrajectory.value.length > 100) {
          robotTrajectory.value.shift()
        }
      }

      robotPosition.value = newPosition
    }

    // Update action and reward
    lastAction.value = (msg.action_taken || (msg as any).action || '') as string
    lastReward.value = (msg.reward_received ?? (msg as any).reward ?? 0) as number

    // Update grid dimensions if provided
    if (msg.grid_width) gridWidth.value = msg.grid_width as number
    if (msg.grid_height) gridHeight.value = msg.grid_height as number

    // Update coverage map if provided
    if (msg.coverage_map) {
      coverageMap.value = msg.coverage_map as unknown as boolean[][]
    }

    // Update threat grid if provided
    if (msg.threat_grid) {
      threatGrid.value = msg.threat_grid as number[][]
    }
  }
}

onMounted(() => {
  // Register message handlers
  on('training_progress', handleTrainingProgress)
  on('training_status', handleTrainingStatus)
  on('training_error', handleTrainingError)
  on('environment_update', handleEnvironmentUpdate)
  on('connection_ack', handleConnectionAck)
  on('pong', handlePong)

  // Connect to WebSocket
  connect(sessionId.value)
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
            :coverage-map="coverageMap"
            :threat-grid="threatGrid"
            :trajectory="robotTrajectory"
          />
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card class="training-session__environment-info">
          <template #header>
            <span>Environment State</span>
          </template>
          <RobotPositionDisplay v-if="robotPositionForDisplay" :position="robotPositionForDisplay" />
          <el-descriptions :column="2" border style="margin-top: 15px">
            <el-descriptions-item label="Position X">
              {{ robotPosition.x.toFixed(2) }}
            </el-descriptions-item>
            <el-descriptions-item label="Position Y">
              {{ robotPosition.y.toFixed(2) }}
            </el-descriptions-item>
            <el-descriptions-item label="Last Action">
              {{ lastAction || 'N/A' }}
            </el-descriptions-item>
            <el-descriptions-item label="Last Reward">
              {{ lastReward.toFixed(4) }}
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
      margin: 0;
    }
  }

  &__metrics {
    margin-bottom: 20px;
  }

  &__environment {
    height: 400px;

    canvas {
      height: 100%;
      width: 100%;
    }
  }

  &__environment-info {
    height: 400px;
  }
}
</style>

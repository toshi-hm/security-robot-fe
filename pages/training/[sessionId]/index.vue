<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'

import EnvironmentVisualization from '~/components/environment/EnvironmentVisualization.vue'
import RobotPositionDisplay from '~/components/environment/RobotPositionDisplay.vue'
import TrainingMetrics from '~/components/training/TrainingMetrics.vue'

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
const handleTrainingProgress = (message: any) => {
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

const handleTrainingStatus = (message: any) => {
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

const handleConnectionAck = (message: any) => {
  console.log('WebSocket connected, client_id:', message.client_id)
}

const handlePong = () => {
  console.log('Pong received')
}

const handleTrainingError = (message: any) => {
  if (message.session_id === sessionId.value) {
    const errorMsg = message.error_message || message.message || 'Unknown error occurred'
    const errorType = message.error_type || 'unknown'

    trainingStatus.value = 'error'
    statusMessage.value = `Error (${errorType}): ${errorMsg}`
    statusType.value = 'error'
    showStatusAlert.value = true
  }
}

const handleEnvironmentUpdate = (message: any) => {
  if (message.session_id === sessionId.value) {
    // Update robot position
    if (message.robot_position) {
      robotPosition.value = {
        x: message.robot_position.x ?? message.robot_position[0] ?? 0,
        y: message.robot_position.y ?? message.robot_position[1] ?? 0,
      }
    }

    // Update action and reward
    lastAction.value = message.action_taken || message.action || ''
    lastReward.value = message.reward_received ?? message.reward ?? 0

    // Update grid dimensions if provided
    if (message.grid_width) gridWidth.value = message.grid_width
    if (message.grid_height) gridHeight.value = message.grid_height

    // Update coverage map if provided
    if (message.coverage_map) {
      coverageMap.value = message.coverage_map
    }

    // Update threat grid if provided
    if (message.threat_grid) {
      threatGrid.value = message.threat_grid
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
    display: flex;
    justify-content: space-between;
    align-items: center;
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
      width: 100%;
      height: 100%;
    }
  }

  &__environment-info {
    height: 400px;
  }
}
</style>

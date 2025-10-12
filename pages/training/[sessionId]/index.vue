<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'

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
})

// WebSocket message handlers
const handleTrainingProgress = (message: any) => {
  if (message.session_id === sessionId.value) {
    currentMetrics.value = {
      timestep: message.data?.timestep || message.timestep || 0,
      episode: message.data?.episode || message.episode || 0,
      reward: message.data?.reward || message.reward || 0,
      loss: message.data?.loss ?? message.loss ?? null,
    }
  }
}

const handleTrainingStatus = (message: any) => {
  if (message.session_id === sessionId.value) {
    console.log('Training status:', message.status, message.message)
  }
}

const handleConnectionAck = (message: any) => {
  console.log('WebSocket connected, client_id:', message.client_id)
}

const handlePong = () => {
  console.log('Pong received')
}

onMounted(() => {
  // Register message handlers
  on('training_progress', handleTrainingProgress)
  on('training_status', handleTrainingStatus)
  on('connection_ack', handleConnectionAck)
  on('pong', handlePong)

  // Connect to WebSocket
  connect(sessionId.value)
})

onBeforeUnmount(() => {
  // Cleanup
  off('training_progress')
  off('training_status')
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
}
</style>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const isConnected = ref(false)
const connectionStatus = ref('disconnected')
const messages = ref<string[]>([])
const sendMessage = ref('')
const sessionId = ref(1)

let socket: WebSocket | null = null

const connect = () => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    ElMessage.warning('Already connected')
    return
  }

  try {
    const url = `ws://127.0.0.1:8000/ws/v1/training/${sessionId.value}`
    socket = new WebSocket(url)

    socket.onopen = () => {
      isConnected.value = true
      connectionStatus.value = 'connected'
      addMessage('✅ Connected to WebSocket')
      ElMessage.success('WebSocket connected')
    }

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        addMessage(`📨 Received: ${JSON.stringify(data, null, 2)}`)
      } catch {
        addMessage(`📨 Received: ${event.data}`)
      }
    }

    socket.onerror = (error) => {
      addMessage(`❌ Error: ${error}`)
      ElMessage.error('WebSocket error')
    }

    socket.onclose = (event) => {
      isConnected.value = false
      connectionStatus.value = 'disconnected'
      addMessage(`🔌 Disconnected: Code ${event.code}, Reason: ${event.reason || 'No reason'}`)
      ElMessage.info('WebSocket disconnected')
    }
  } catch (error) {
    addMessage(`❌ Connection failed: ${error}`)
    ElMessage.error('Failed to connect')
  }
}

const disconnect = () => {
  if (socket) {
    socket.close(1000, 'User initiated disconnect')
    socket = null
  }
}

const send = () => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    ElMessage.warning('Not connected')
    return
  }

  if (!sendMessage.value.trim()) {
    ElMessage.warning('Message cannot be empty')
    return
  }

  try {
    const message = JSON.parse(sendMessage.value)
    socket.send(JSON.stringify(message))
    addMessage(`📤 Sent: ${sendMessage.value}`)
    sendMessage.value = ''
  } catch {
    ElMessage.error('Invalid JSON')
  }
}

const sendPing = () => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    ElMessage.warning('Not connected')
    return
  }

  const ping = { type: 'ping' }
  socket.send(JSON.stringify(ping))
  addMessage(`📤 Sent ping`)
}

const addMessage = (message: string) => {
  const timestamp = new Date().toLocaleTimeString('ja-JP')
  messages.value.unshift(`[${timestamp}] ${message}`)
  if (messages.value.length > 100) {
    messages.value = messages.value.slice(0, 100)
  }
}

const clearMessages = () => {
  messages.value = []
}

const loadPingExample = () => {
  sendMessage.value = '{"type": "ping"}'
}

onMounted(() => {
  addMessage('🚀 WebSocket Test Page loaded')
})

onBeforeUnmount(() => {
  disconnect()
})
</script>

<template>
  <div class="websocket-test">
    <div class="websocket-test__header">
      <h2>WebSocket Connection Test</h2>
      <el-tag :type="isConnected ? 'success' : 'info'">
        {{ connectionStatus }}
      </el-tag>
    </div>

    <el-card class="websocket-test__card">
      <template #header>
        <span>Connection Settings</span>
      </template>

      <el-form label-width="120px">
        <el-form-item label="Session ID">
          <el-input-number v-model="sessionId" :min="1" :disabled="isConnected" />
        </el-form-item>

        <el-form-item label="WebSocket URL">
          <el-input :model-value="`ws://127.0.0.1:8000/ws/v1/training/${sessionId}`" readonly />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :disabled="isConnected" @click="connect"> Connect </el-button>
          <el-button type="danger" :disabled="!isConnected" @click="disconnect"> Disconnect </el-button>
          <el-button type="info" :disabled="!isConnected" @click="sendPing"> Send Ping </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="websocket-test__card">
      <template #header>
        <div class="websocket-test__send-header">
          <span>Send Message</span>
        </div>
      </template>

      <el-input
        v-model="sendMessage"
        type="textarea"
        :rows="4"
        placeholder='{"type": "ping"}'
        :disabled="!isConnected"
      />
      <div class="websocket-test__send-actions">
        <el-button type="primary" :disabled="!isConnected" @click="send"> Send </el-button>
        <el-button @click="loadPingExample"> Load Ping Example </el-button>
      </div>
    </el-card>

    <el-card class="websocket-test__card">
      <template #header>
        <div class="websocket-test__messages-header">
          <span>Messages ({{ messages.length }})</span>
          <el-button size="small" @click="clearMessages"> Clear </el-button>
        </div>
      </template>

      <div class="websocket-test__messages">
        <div v-if="messages.length === 0" class="websocket-test__empty">No messages</div>
        <div v-for="(message, index) in messages" :key="index" class="websocket-test__message">
          <code>{{ message }}</code>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.websocket-test {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
    }
  }

  &__card {
    margin-bottom: 20px;
  }

  &__send-header,
  &__messages-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__send-actions {
    margin-top: 10px;
    display: flex;
    gap: 10px;
  }

  &__messages {
    max-height: 400px;
    overflow-y: auto;
    background-color: #f5f7fa;
    padding: 15px;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    font-size: 12px;
  }

  &__empty {
    color: #909399;
    text-align: center;
    padding: 20px;
  }

  &__message {
    margin-bottom: 8px;
    padding: 8px;
    background-color: white;
    border-left: 3px solid #409eff;
    border-radius: 2px;

    code {
      color: #303133;
      white-space: pre-wrap;
      word-break: break-all;
    }
  }
}
</style>

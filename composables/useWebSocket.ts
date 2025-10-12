import { ref } from 'vue'

/**
 * WebSocket管理Composable
 *
 * 依存性注入パターンでテスタビリティを確保
 * @param socketFactory - Socket.IO接続ファクトリ (テスト時はモック注入可能)
 */
export const useWebSocket = () => {
  const socket = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const error = ref<string | null>(null)
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = 5
  const reconnectDelay = 1000

  const config = useRuntimeConfig()

  /**
   * WebSocket接続を確立
   */
  const connect = (sessionId: number) => {
    if (socket.value && socket.value.readyState === WebSocket.OPEN) {
      console.warn('WebSocket already connected')
      return
    }

    try {
      const url = `${config.public.wsUrl}/ws/v1/training/${sessionId}`
      socket.value = new WebSocket(url)

      socket.value.onopen = () => {
        isConnected.value = true
        error.value = null
        reconnectAttempts.value = 0
        console.log('WebSocket connected to session:', sessionId)
      }

      socket.value.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          handleMessage(message)
        } catch (e) {
          console.error('Failed to parse WebSocket message:', e)
        }
      }

      socket.value.onerror = (event) => {
        error.value = 'WebSocket connection error'
        console.error('WebSocket error:', event)
      }

      socket.value.onclose = (event) => {
        isConnected.value = false
        console.log('WebSocket closed:', event.code, event.reason)

        // Auto-reconnect logic
        if (reconnectAttempts.value < maxReconnectAttempts && event.code !== 1000) {
          reconnectAttempts.value++
          setTimeout(() => {
            console.log(`Attempting to reconnect (${reconnectAttempts.value}/${maxReconnectAttempts})...`)
            connect(sessionId)
          }, reconnectDelay * reconnectAttempts.value)
        } else if (reconnectAttempts.value >= maxReconnectAttempts) {
          error.value = 'Maximum reconnection attempts reached'
        }
      }
    } catch (e) {
      error.value = 'Failed to establish WebSocket connection'
      console.error('WebSocket connection error:', e)
    }
  }

  /**
   * WebSocket切断
   */
  const disconnect = () => {
    if (socket.value) {
      socket.value.close(1000, 'Client initiated disconnect')
      socket.value = null
      isConnected.value = false
      error.value = null
      reconnectAttempts.value = 0
    }
  }

  /**
   * メッセージ送信
   */
  const send = (message: Record<string, any>) => {
    if (socket.value && socket.value.readyState === WebSocket.OPEN) {
      socket.value.send(JSON.stringify(message))
    } else {
      console.warn('Cannot send message: WebSocket not connected')
    }
  }

  /**
   * Ping送信
   */
  const sendPing = () => {
    send({ type: 'ping' })
  }

  /**
   * メッセージハンドラ（拡張可能）
   */
  const messageHandlers = ref<Map<string, (data: any) => void>>(new Map())

  const handleMessage = (message: any) => {
    const handler = messageHandlers.value.get(message.type)
    if (handler) {
      handler(message)
    }
  }

  /**
   * メッセージタイプハンドラの登録
   */
  const on = (messageType: string, handler: (data: any) => void) => {
    messageHandlers.value.set(messageType, handler)
  }

  /**
   * メッセージタイプハンドラの削除
   */
  const off = (messageType: string) => {
    messageHandlers.value.delete(messageType)
  }

  // Lifecycle hooks
  onBeforeUnmount(() => {
    disconnect()
  })

  return {
    socket: readonly(socket),
    isConnected: readonly(isConnected),
    error: readonly(error),
    connect,
    disconnect,
    send,
    sendPing,
    on,
    off,
  }
}

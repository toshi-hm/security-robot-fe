import { ref, readonly, onBeforeUnmount } from 'vue'

import type { TrainingRepository } from '~/libs/repositories/training/TrainingRepository'
import { TrainingRepositoryImpl } from '~/libs/repositories/training/TrainingRepositoryImpl'

/**
 * WebSocket管理Composable
 *
 * 依存性注入パターンでテスタビリティを確保
 * @param repository - TrainingRepository (テスト時はモック注入可能)
 */
export const useWebSocket = (repository: TrainingRepository = new TrainingRepositoryImpl()) => {
  const socket = ref<WebSocket | null>(null)
  const isConnected = ref(false)
  const error = ref<string | null>(null)
  const reconnectAttempts = ref(0)
  const maxReconnectAttempts = 5
  const reconnectDelay = 1000
  const useFallbackPolling = ref(false)
  const pollingInterval = ref<ReturnType<typeof setInterval> | null>(null)

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
      const url = `${config.public.wsUrl}/api/v1/ws/training/${sessionId}`
      socket.value = new WebSocket(url)

      socket.value.onopen = () => {
        isConnected.value = true
        error.value = null
        reconnectAttempts.value = 0
        // WebSocket connection established successfully
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
        // WebSocket connection closed

        // Auto-reconnect logic
        if (reconnectAttempts.value < maxReconnectAttempts && event.code !== 1000) {
          reconnectAttempts.value++
          setTimeout(() => {
            // Attempting reconnection
            connect(sessionId)
          }, reconnectDelay * reconnectAttempts.value)
        } else if (reconnectAttempts.value >= maxReconnectAttempts) {
          error.value = 'Maximum reconnection attempts reached'
          console.warn('WebSocket再接続失敗。ポーリングモードに切替え')
          startFallbackPolling(sessionId)
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
    stopFallbackPolling()
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
  const send = (message: Record<string, unknown>) => {
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
  type MessageHandler = (data: Record<string, unknown>) => void
  const messageHandlers = ref<Map<string, MessageHandler>>(new Map())

  const handleMessage = (message: Record<string, unknown>) => {
    const messageType = typeof message.type === 'string' ? message.type : ''
    const handler = messageHandlers.value.get(messageType)
    if (handler) {
      handler(message)
    }
  }

  /**
   * メッセージタイプハンドラの登録
   */
  const on = (messageType: string, handler: MessageHandler) => {
    messageHandlers.value.set(messageType, handler)
  }

  /**
   * メッセージタイプハンドラの削除
   */
  const off = (messageType: string) => {
    messageHandlers.value.delete(messageType)
  }

  /**
   * フォールバックポーリング開始
   */
  const startFallbackPolling = (sessionId: number) => {
    if (pollingInterval.value) {
      return // すでにポーリング中
    }

    // Starting fallback polling mechanism
    useFallbackPolling.value = true

    pollingInterval.value = setInterval(async () => {
      try {
        // セッション状態を取得
        const session = await repository.findById(sessionId)
        if (session) {
          // メトリクスハンドラーを呼び出す
          const handler = messageHandlers.value.get('metrics')
          if (handler) {
            // メトリクスを取得して更新通知
            const metrics = await repository.getMetrics(sessionId, 10)
            handler({ type: 'metrics', data: metrics })
          }
        }
      } catch (e) {
        console.error('Fallback polling error:', e)
      }
    }, 3000) // 3秒ごと
  }

  /**
   * フォールバックポーリング停止
   */
  const stopFallbackPolling = () => {
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value)
      pollingInterval.value = null
      useFallbackPolling.value = false
      // Fallback polling stopped
    }
  }

  // Lifecycle hooks
  onBeforeUnmount(() => {
    disconnect()
    stopFallbackPolling()
  })

  return {
    socket: readonly(socket),
    isConnected: readonly(isConnected),
    error: readonly(error),
    useFallbackPolling: readonly(useFallbackPolling),
    connect,
    disconnect,
    send,
    sendPing,
    on,
    off,
  }
}

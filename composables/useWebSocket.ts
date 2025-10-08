import { io, type Socket } from 'socket.io-client'
import { ref } from 'vue'

/**
 * WebSocket管理Composable
 *
 * 依存性注入パターンでテスタビリティを確保
 * @param socketFactory - Socket.IO接続ファクトリ (テスト時はモック注入可能)
 */
export const useWebSocket = (socketFactory?: (url?: string) => Socket) => {
  const socket = ref<Socket | null>(null)
  const isConnected = ref(false)

  const connect = () => {
    if (socket.value?.connected) {
      return
    }

    // ファクトリが提供されている場合はそれを使用、なければデフォルトのio
    if (socketFactory) {
      socket.value = socketFactory()
    } else {
      const config = useRuntimeConfig()
      socket.value = io(config.public.wsUrl)
    }

    // 接続イベントリスナー
    socket.value.on('connect', () => {
      isConnected.value = true
    })

    socket.value.on('disconnect', () => {
      isConnected.value = false
    })
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect()
      socket.value = null
      isConnected.value = false
    }
  }

  // ライフサイクルフック（実際のコンポーネント内でのみ動作）
  if (typeof onMounted !== 'undefined') {
    onMounted(connect)
  }

  if (typeof onBeforeUnmount !== 'undefined') {
    onBeforeUnmount(disconnect)
  }

  return {
    socket,
    isConnected,
    connect,
    disconnect,
  }
}

import { defineStore } from 'pinia'
import { useWebSocket } from '~/composables/useWebSocket'

export const useWebSocketStore = defineStore('websocket', () => {
  const { socket, connect, disconnect } = useWebSocket()

  return {
    socket,
    connect,
    disconnect,
  }
})

import { io, type Socket } from 'socket.io-client'

export const useWebSocket = () => {
  const socket = shallowRef<Socket | null>(null)

  const connect = () => {
    if (!socket.value) {
      socket.value = io(useRuntimeConfig().public.wsUrl)
    }
  }

  const disconnect = () => {
    socket.value?.disconnect()
    socket.value = null
  }

  onMounted(connect)
  onBeforeUnmount(disconnect)

  return {
    socket,
    connect,
    disconnect,
  }
}

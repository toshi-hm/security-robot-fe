import { io, type Socket } from 'socket.io-client'

export default defineNuxtPlugin((): { provide: { socket: Socket } } => {
  const runtimeConfig = useRuntimeConfig()
  const socket = io(runtimeConfig.public.wsUrl)

  return {
    provide: {
      socket,
    },
  }
})

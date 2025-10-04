import { io } from 'socket.io-client'

export default defineNuxtPlugin(() => {
  const runtimeConfig = useRuntimeConfig()
  const socket = io(runtimeConfig.public.wsUrl)

  return {
    provide: {
      socket,
    },
  }
})

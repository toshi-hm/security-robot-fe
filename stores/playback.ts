import { defineStore } from 'pinia'
import { usePlayback } from '~/composables/usePlayback'

export const usePlaybackStore = defineStore('playback', () => {
  const service = usePlayback()

  return {
    ...service,
  }
})

import { defineStore } from 'pinia'

import { ref } from 'vue'

import { usePlayback } from '~/composables/usePlayback'

export const usePlaybackStore = defineStore('playback', () => {
  const service = usePlayback()

  // Additional state for UI
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentSessionId = ref<string | null>(null)
  const currentFrameIndex = ref(0)
  const isPlaying = ref(false)
  const playbackSpeed = ref(1)

  /**
   * Fetch all playback sessions (completed training sessions)
   */
  const fetchSessions = async () => {
    isLoading.value = true
    error.value = null

    try {
      await service.fetchSessions()
    } catch (err) {
      error.value = 'セッション一覧の取得に失敗しました'
      console.error('Failed to fetch playback sessions:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch frames for a specific session
   */
  const fetchFrames = async (sessionId: string) => {
    isLoading.value = true
    error.value = null
    currentSessionId.value = sessionId
    currentFrameIndex.value = 0

    try {
      await service.fetchFrames(sessionId)
    } catch (err) {
      error.value = 'フレームデータの取得に失敗しました'
      console.error(`Failed to fetch frames for session ${sessionId}:`, err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Play/Resume playback
   */
  const play = () => {
    isPlaying.value = true
  }

  /**
   * Pause playback
   */
  const pause = () => {
    isPlaying.value = false
  }

  /**
   * Stop playback and reset to beginning
   */
  const stop = () => {
    isPlaying.value = false
    currentFrameIndex.value = 0
  }

  /**
   * Seek to specific frame
   */
  const seekToFrame = (frameIndex: number) => {
    if (frameIndex >= 0 && frameIndex < service.frames.value.length) {
      currentFrameIndex.value = frameIndex
    }
  }

  /**
   * Set playback speed (0.5x, 1x, 2x, etc.)
   */
  const setPlaybackSpeed = (speed: number) => {
    playbackSpeed.value = speed
  }

  return {
    // From service
    sessions: service.sessions,
    frames: service.frames,

    // Additional state
    isLoading,
    error,
    currentSessionId,
    currentFrameIndex,
    isPlaying,
    playbackSpeed,

    // Actions
    fetchSessions,
    fetchFrames,
    play,
    pause,
    stop,
    seekToFrame,
    setPlaybackSpeed,
  }
})

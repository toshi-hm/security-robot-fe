import { setActivePinia, createPinia } from 'pinia'

import { describe, it, expect, beforeEach, vi } from 'vitest'

import { usePlaybackStore } from '~/stores/playback'

// Mock usePlayback composable
const mockFetchSessions = vi.fn()
const mockFetchFrames = vi.fn()

vi.mock('~/composables/usePlayback', () => ({
  usePlayback: () => ({
    sessions: { value: [] },
    frames: { value: [] },
    fetchSessions: mockFetchSessions,
    fetchFrames: mockFetchFrames,
  }),
}))

describe('Playback Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const store = usePlaybackStore()

      expect(store.isLoading).toBe(false)
      expect(store.error).toBe(null)
      expect(store.currentSessionId).toBe(null)
      expect(store.currentFrameIndex).toBe(0)
      expect(store.isPlaying).toBe(false)
      expect(store.playbackSpeed).toBe(1)
    })
  })

  describe('fetchSessions', () => {
    it('should fetch sessions successfully', async () => {
      mockFetchSessions.mockResolvedValueOnce(undefined)
      const store = usePlaybackStore()

      await store.fetchSessions()

      expect(mockFetchSessions).toHaveBeenCalledOnce()
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe(null)
    })

    it('should set loading state during fetch', async () => {
      let loadingDuringFetch = false
      mockFetchSessions.mockImplementationOnce(async () => {
        loadingDuringFetch = store.isLoading
      })

      const store = usePlaybackStore()
      await store.fetchSessions()

      expect(loadingDuringFetch).toBe(true)
      expect(store.isLoading).toBe(false)
    })

    it('should handle fetch errors', async () => {
      const error = new Error('Network error')
      mockFetchSessions.mockRejectedValueOnce(error)
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const store = usePlaybackStore()

      await expect(store.fetchSessions()).rejects.toThrow('Network error')
      expect(store.error).toBe('セッション一覧の取得に失敗しました')
      expect(store.isLoading).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch playback sessions:', error)

      consoleSpy.mockRestore()
    })
  })

  describe('fetchFrames', () => {
    it('should fetch frames successfully', async () => {
      mockFetchFrames.mockResolvedValueOnce(undefined)
      const store = usePlaybackStore()

      await store.fetchFrames('session-123')

      expect(mockFetchFrames).toHaveBeenCalledWith('session-123')
      expect(store.currentSessionId).toBe('session-123')
      expect(store.currentFrameIndex).toBe(0)
      expect(store.isLoading).toBe(false)
      expect(store.error).toBe(null)
    })

    it('should set loading state during fetch', async () => {
      let loadingDuringFetch = false
      mockFetchFrames.mockImplementationOnce(async () => {
        loadingDuringFetch = store.isLoading
      })

      const store = usePlaybackStore()
      await store.fetchFrames('session-123')

      expect(loadingDuringFetch).toBe(true)
      expect(store.isLoading).toBe(false)
    })

    it('should reset frame index when fetching new session', async () => {
      mockFetchFrames.mockResolvedValue(undefined)
      const store = usePlaybackStore()

      store.currentFrameIndex = 42
      await store.fetchFrames('session-456')

      expect(store.currentFrameIndex).toBe(0)
    })

    it('should handle fetch errors', async () => {
      const error = new Error('Fetch failed')
      mockFetchFrames.mockRejectedValueOnce(error)
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const store = usePlaybackStore()

      await expect(store.fetchFrames('session-123')).rejects.toThrow('Fetch failed')
      expect(store.error).toBe('フレームデータの取得に失敗しました')
      expect(store.isLoading).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch frames for session session-123:', error)

      consoleSpy.mockRestore()
    })
  })

  describe('Playback Controls', () => {
    it('should play playback', () => {
      const store = usePlaybackStore()

      expect(store.isPlaying).toBe(false)
      store.play()
      expect(store.isPlaying).toBe(true)
    })

    it('should pause playback', () => {
      const store = usePlaybackStore()

      store.isPlaying = true
      store.pause()
      expect(store.isPlaying).toBe(false)
    })

    it('should stop playback and reset frame index', () => {
      const store = usePlaybackStore()

      store.isPlaying = true
      store.currentFrameIndex = 42
      store.stop()

      expect(store.isPlaying).toBe(false)
      expect(store.currentFrameIndex).toBe(0)
    })
  })

  describe('seekToFrame', () => {
    it('should seek to valid frame index', () => {
      const store = usePlaybackStore()
      // Mock frames array by modifying the value property
      ;(store.frames as any).value = [{ id: 1 }, { id: 2 }, { id: 3 }]

      store.seekToFrame(2)
      expect(store.currentFrameIndex).toBe(2)
    })

    it('should not seek to negative frame index', () => {
      const store = usePlaybackStore()
      ;(store.frames as any).value = [{ id: 1 }, { id: 2 }]
      store.currentFrameIndex = 0

      store.seekToFrame(-1)
      expect(store.currentFrameIndex).toBe(0)
    })

    it('should not seek beyond frames length', () => {
      const store = usePlaybackStore()
      ;(store.frames as any).value = [{ id: 1 }, { id: 2 }]
      store.currentFrameIndex = 0

      store.seekToFrame(5)
      expect(store.currentFrameIndex).toBe(0)
    })

    it('should seek to first frame (0)', () => {
      const store = usePlaybackStore()
      ;(store.frames as any).value = [{ id: 1 }, { id: 2 }, { id: 3 }]
      store.currentFrameIndex = 2

      store.seekToFrame(0)
      expect(store.currentFrameIndex).toBe(0)
    })

    it('should seek to last frame', () => {
      const store = usePlaybackStore()
      ;(store.frames as any).value = [{ id: 1 }, { id: 2 }, { id: 3 }]

      store.seekToFrame(2)
      expect(store.currentFrameIndex).toBe(2)
    })
  })

  describe('setPlaybackSpeed', () => {
    it('should set playback speed to 0.5x', () => {
      const store = usePlaybackStore()

      store.setPlaybackSpeed(0.5)
      expect(store.playbackSpeed).toBe(0.5)
    })

    it('should set playback speed to 2x', () => {
      const store = usePlaybackStore()

      store.setPlaybackSpeed(2)
      expect(store.playbackSpeed).toBe(2)
    })

    it('should set playback speed to 1x (default)', () => {
      const store = usePlaybackStore()
      store.playbackSpeed = 2

      store.setPlaybackSpeed(1)
      expect(store.playbackSpeed).toBe(1)
    })
  })
})

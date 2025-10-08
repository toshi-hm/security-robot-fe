import { setActivePinia, createPinia } from 'pinia'

import { describe, it, expect, beforeEach, vi } from 'vitest'

import { usePlaybackStore } from '~/stores/playback'

// Mock usePlayback composable
vi.mock('~/composables/usePlayback', () => ({
  usePlayback: () => ({
    sessions: [],
    frames: [],
    isLoading: false,
    error: null,
    fetchSessions: vi.fn(),
    fetchFrames: vi.fn(),
  }),
}))

describe('Playback Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize the store', () => {
    const store = usePlaybackStore()

    expect(store).toBeDefined()
  })

  it('should expose playback service methods', () => {
    const store = usePlaybackStore()

    expect(store.fetchSessions).toBeDefined()
    expect(store.fetchFrames).toBeDefined()
  })

  it('should expose playback service state', () => {
    const store = usePlaybackStore()

    expect(store.sessions).toBeDefined()
    expect(store.frames).toBeDefined()
    expect(store.isLoading).toBeDefined()
    expect(store.error).toBeDefined()
  })
})

import { setActivePinia, createPinia } from 'pinia'

import { describe, it, expect, beforeEach, vi } from 'vitest'

import { useTrainingStore } from '~/stores/training'

// Mock useTraining composable
vi.mock('~/composables/useTraining', () => ({
  useTraining: () => ({
    sessions: [],
    currentSession: null,
    metrics: [],
    isLoading: false,
    error: null,
    activeSessions: [],
    completedSessions: [],
    fetchSessions: vi.fn(),
    createSession: vi.fn(),
    stopSession: vi.fn(),
    fetchMetrics: vi.fn(),
  }),
}))

describe('Training Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize the store', () => {
    const store = useTrainingStore()

    expect(store).toBeDefined()
  })

  it('should expose training service methods', () => {
    const store = useTrainingStore()

    expect(store.fetchSessions).toBeDefined()
    expect(store.createSession).toBeDefined()
    expect(store.stopSession).toBeDefined()
    expect(store.fetchMetrics).toBeDefined()
  })

  it('should expose training service state', () => {
    const store = useTrainingStore()

    expect(store.sessions).toBeDefined()
    expect(store.currentSession).toBeDefined()
    expect(store.metrics).toBeDefined()
    expect(store.isLoading).toBeDefined()
    expect(store.error).toBeDefined()
  })

  it('should expose computed properties', () => {
    const store = useTrainingStore()

    expect(store.activeSessions).toBeDefined()
    expect(store.completedSessions).toBeDefined()
  })
})

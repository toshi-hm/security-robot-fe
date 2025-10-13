import { setActivePinia, createPinia } from 'pinia'

import { describe, it, expect, beforeEach, vi } from 'vitest'

import { useEnvironmentStore } from '~/stores/environment'

// Mock useEnvironment composable
vi.mock('~/composables/useEnvironment', () => ({
  useEnvironment: () => ({
    environments: [],
    currentState: null,
    isLoading: false,
    error: null,
    fetchEnvironments: vi.fn(),
    fetchState: vi.fn(),
  }),
}))

describe('Environment Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize the store', () => {
    const store = useEnvironmentStore()

    expect(store).toBeDefined()
  })

  it('should expose environment service methods', () => {
    const store = useEnvironmentStore()

    expect(store.fetchEnvironments).toBeDefined()
    expect(store.fetchState).toBeDefined()
  })

  it('should expose environment service state', () => {
    const store = useEnvironmentStore()

    expect(store.environments).toBeDefined()
    expect(store.currentState).toBeDefined()
  })
})

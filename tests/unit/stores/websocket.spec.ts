import { setActivePinia, createPinia } from 'pinia'

import { describe, it, expect, beforeEach, vi } from 'vitest'

import { useWebSocketStore } from '~/stores/websocket'

// Mock useWebSocket composable
vi.mock('~/composables/useWebSocket', () => ({
  useWebSocket: () => ({
    socket: { value: null },
    connect: vi.fn(),
    disconnect: vi.fn(),
  }),
}))

describe('WebSocket Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('should initialize the store', () => {
    const store = useWebSocketStore()

    expect(store).toBeDefined()
  })

  it('should expose websocket methods', () => {
    const store = useWebSocketStore()

    expect(store.connect).toBeDefined()
    expect(store.disconnect).toBeDefined()
  })

  it('should expose socket state', () => {
    const store = useWebSocketStore()

    expect(store.socket).toBeDefined()
  })
})

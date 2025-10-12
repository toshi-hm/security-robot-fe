import { describe, it, expect, beforeEach, vi } from 'vitest'

import { useWebSocket } from '~/composables/useWebSocket'

// Mock useRuntimeConfig globally
vi.stubGlobal('useRuntimeConfig', () => ({
  public: {
    wsUrl: 'ws://localhost:8000',
  },
}))

describe('useWebSocket', () => {
  let mockWebSocket: any

  beforeEach(() => {
    // Native WebSocketのモック作成
    mockWebSocket = {
      readyState: 0,
      send: vi.fn(),
      close: vi.fn(),
      onopen: null,
      onmessage: null,
      onerror: null,
      onclose: null,
    }

    // グローバルWebSocketのモック設定
    const MockWebSocket = vi.fn(() => mockWebSocket)
    MockWebSocket.CONNECTING = 0
    MockWebSocket.OPEN = 1
    MockWebSocket.CLOSING = 2
    MockWebSocket.CLOSED = 3

    global.WebSocket = MockWebSocket as any
  })

  describe('connect', () => {
    it('creates WebSocket connection with session ID', () => {
      const { connect } = useWebSocket()

      connect(1)

      expect(global.WebSocket).toHaveBeenCalledWith(expect.stringContaining('/ws/v1/training/1'))
    })

    it('does not create multiple connections if already open', () => {
      mockWebSocket.readyState = 1 // OPEN
      const { connect } = useWebSocket()

      connect(1)
      connect(1)

      expect(global.WebSocket).toHaveBeenCalledTimes(1)
    })

    it('updates isConnected when socket opens', () => {
      const { connect, isConnected } = useWebSocket()

      connect(1)
      mockWebSocket.onopen()

      expect(isConnected.value).toBe(true)
    })

    it('handles incoming messages', () => {
      const { connect, on } = useWebSocket()
      const handler = vi.fn()

      connect(1)
      on('test_message', handler)

      const messageEvent = {
        data: JSON.stringify({ type: 'test_message', data: 'hello' }),
      }
      mockWebSocket.onmessage(messageEvent)

      expect(handler).toHaveBeenCalledWith({ type: 'test_message', data: 'hello' })
    })

    it('sets error on WebSocket error', () => {
      const { connect, error } = useWebSocket()

      connect(1)
      mockWebSocket.onerror(new Error('Connection failed'))

      expect(error.value).toBe('WebSocket connection error')
    })

    it('updates isConnected to false on close', () => {
      const { connect, isConnected } = useWebSocket()

      connect(1)
      mockWebSocket.onopen()
      mockWebSocket.onclose({ code: 1000, reason: 'Normal closure' })

      expect(isConnected.value).toBe(false)
    })
  })

  describe('disconnect', () => {
    it('closes WebSocket connection', () => {
      const { connect, disconnect } = useWebSocket()

      connect(1)
      disconnect()

      expect(mockWebSocket.close).toHaveBeenCalledWith(1000, 'Client initiated disconnect')
    })

    it('resets state after disconnect', () => {
      const { connect, disconnect, isConnected, socket } = useWebSocket()

      connect(1)
      mockWebSocket.onopen()
      disconnect()

      expect(isConnected.value).toBe(false)
      expect(socket.value).toBeNull()
    })
  })

  describe('send', () => {
    it('sends JSON message when connected', () => {
      mockWebSocket.readyState = 1 // OPEN
      const { connect, send } = useWebSocket()

      connect(1)
      send({ type: 'test', data: 'hello' })

      expect(mockWebSocket.send).toHaveBeenCalledWith('{"type":"test","data":"hello"}')
    })

    it('does not send when not connected', () => {
      const { send } = useWebSocket()

      send({ type: 'test' })

      expect(mockWebSocket.send).not.toHaveBeenCalled()
    })
  })

  describe('sendPing', () => {
    it('sends ping message', () => {
      mockWebSocket.readyState = 1 // OPEN
      const { connect, sendPing } = useWebSocket()

      connect(1)
      sendPing()

      expect(mockWebSocket.send).toHaveBeenCalledWith('{"type":"ping"}')
    })
  })

  describe('message handlers', () => {
    it('registers and calls message handler', () => {
      const { connect, on } = useWebSocket()
      const handler = vi.fn()

      on('training_progress', handler)
      connect(1)

      const messageEvent = {
        data: JSON.stringify({ type: 'training_progress', timestep: 100 }),
      }
      mockWebSocket.onmessage(messageEvent)

      expect(handler).toHaveBeenCalledWith({ type: 'training_progress', timestep: 100 })
    })

    it('removes message handler with off', () => {
      const { connect, on, off } = useWebSocket()
      const handler = vi.fn()

      on('test', handler)
      off('test')
      connect(1)

      const messageEvent = {
        data: JSON.stringify({ type: 'test' }),
      }
      mockWebSocket.onmessage(messageEvent)

      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('initial state', () => {
    it('has null socket initially', () => {
      const { socket } = useWebSocket()

      expect(socket.value).toBeNull()
    })

    it('has isConnected false initially', () => {
      const { isConnected } = useWebSocket()

      expect(isConnected.value).toBe(false)
    })

    it('has null error initially', () => {
      const { error } = useWebSocket()

      expect(error.value).toBeNull()
    })
  })
})
